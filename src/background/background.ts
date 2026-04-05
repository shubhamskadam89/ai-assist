// Background service worker for CodeMentor extension
import { apiService } from '../services/apiService'
console.log('CodeMentor background script loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('CodeMentor extension installed:', details);

  // Initialize default settings
  chrome.storage.local.set({
    settings: {
      theme: 'light',
      enabled: true,
      showHints: true,
      showProgress: true,
      autoCapture: true
    },
    userProgress: {}
  });
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);

  switch (message.type) {
    case 'CAPTURE_CODE':
      handleCodeCapture(message.data, sender.tab?.id);
      break;

    case 'CAPTURE_SIGNAL':
      handleSignal(message.data, sender.tab?.id);
      break;

    case 'CAPTURE_PROBLEM':
      handleProblemCapture(message.data);
      break;

    case 'CAPTURE_CODE_UPDATE':
      handleCodeUpdate(message.data, sender.tab?.id);
      break;

    case 'GET_SETTINGS':
      chrome.storage.local.get(['settings'], (result) => {
        sendResponse(result.settings || {});
      });
      return true; // Keep message channel open for async response

    case 'SAVE_PROGRESS':
      handleProgressSave(message.data);
      break;

    case 'GET_PROGRESS':
      chrome.storage.local.get(['userProgress'], (result) => {
        sendResponse(result.userProgress || {});
      });
      return true;

    case 'GET_HINTS': {
      const { code, language, problemId } = message.data || {}
        ; (async () => {
          try {
            let effectiveCode: string | undefined = code
            if (!effectiveCode && problemId) {
              const store = await chrome.storage.local.get(['problemCodeMap'])
              const map = store.problemCodeMap || {}
              effectiveCode = map[problemId]?.code
            }
            const hints = await apiService.getHintsForCode(effectiveCode || '', language || 'unknown', problemId)
            sendResponse(hints)
          } catch (e) {
            console.error('GET_HINTS failed:', e)
            sendResponse([])
          }
        })()
      return true
    }

    case 'SEND_CODE_TO_AI': {
      const { code, language, problemId } = message.data || {}
        ; (async () => {
          try {
            const store = await chrome.storage.local.get(['problemContextMap']);
            const map = store.problemContextMap || {};
            const contextId = map[problemId];

            if (!contextId) {
                const legacy = await apiService.analyzeCodeLegacy(code, language, problemId);
                sendResponse(legacy);
                return;
            }

            const req = {
                sessionId: 'session-' + Date.now(),
                problemContextId: contextId,
                language: language,
                rawCode: code,
                studentLevel: store.settings?.studentLevel || 'intermediate',
                signalVector: {
                    hasRecursion: false,
                    hasDPArray: false,
                    hasMemo: false,
                    usesSort: false,
                    usesHashMap: false,
                    loopDepth: 0
                }
            };
            const analysis = await apiService.analyzeCode(req);
            await chrome.storage.local.set({ latestHints: analysis.hints || [] });
            sendResponse(analysis);
          } catch (e) {
            console.error('SEND_CODE_TO_AI failed:', e)
            sendResponse(null)
          }
        })()
      return true
    }

    default:
      console.log('Unknown message type:', message.type);
  }
});

// Handle code capture from content script
function handleCodeCapture(data: any, _tabId?: number) {
  console.log('Code captured:', data);

  // Store current problem info for popup/state
  const currentProblem = {
    id: data.problemId,
    title: data.problemTitle,
    language: data.language,
    platform: data.platform
  }
  chrome.storage.local.set({ currentProblem })

  // Store latest code for this problem in a map
  chrome.storage.local.get(['problemCodeMap'], (result) => {
    const problemCodeMap = result.problemCodeMap || {}
    problemCodeMap[data.problemId] = {
      code: data.code,
      language: data.language,
      timestamp: Date.now()
    }
    chrome.storage.local.set({ problemCodeMap })
  })

  // TODO: Send to AI service when backend is ready
  // For now, we'll just log it
  console.log('Code ready for AI processing:', {
    problemId: data.problemId,
    code: data.code,
    language: data.language
  });
}

// Helper to get a stable key for a problem URL (e.g., from LeetCode)
function getProblemKey(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('leetcode.com')) {
      // Extract the slug (e.g., /problems/add-two-numbers/description/ -> add-two-numbers)
      const match = parsed.pathname.match(/\/problems\/([^/]+)/);
      return match ? `leetcode_${match[1]}` : url;
    }
    return url;
  } catch {
    return url;
  }
}

function handleProblemCapture(data: any) {
  console.log('Problem captured:', data);

  apiService.detectProblem(data).then(response => {
    console.log('Problem context established:', response.problemContextId);

    // Store context ID associated with the problem URL or ID
    chrome.storage.local.get(['problemContextMap'], (result) => {
      const map = result.problemContextMap || {};
      const key = getProblemKey(data.url);
      map[key] = response.problemContextId;
      chrome.storage.local.set({ 
        problemContextMap: map,
        currentProblem: {
          id: key,
          title: data.title,
          language: 'auto',
          platform: data.platform
        }
      });
    });

  }).catch(err => {
    console.error('Error detecting problem:', err);
  });
}

function handleCodeUpdate(data: any, tabId?: number) {
  // data should contain { sessionId, language, rawCode, signalVector, url }
  console.log('Code update captured:', data);

  chrome.storage.local.get(['problemContextMap'], (result) => {
    const map = result.problemContextMap || {};
    const key = getProblemKey(data.url);
    const problemContextId = map[key];

    if (!problemContextId) {
      console.warn('No problem context ID found for key:', key);
      // Optional: Re-trigger capture if missing?
      return;
    }

    const updateRequest = {
      sessionId: data.sessionId,
      problemContextId: problemContextId,
      language: data.language,
      rawCode: data.rawCode,
      signalVector: data.signalVector
    };

    apiService.analyzeCode(updateRequest).then(async response => {
      console.log('Received analysis response from backend:', response);

      // ⭐ STORE HINTS FOR POPUP (with history)
      await saveHintsToStorage(response, data.title || data.url || 'Unknown Problem');

      if (tabId !== undefined && tabId !== null) {
        console.log('SENDING HINT_UPDATE TO TAB ID:', tabId, 'Data:', response);
        chrome.tabs.sendMessage(tabId, {
          type: 'HINT_UPDATE',
          data: response
        }, (result) => {
          if (chrome.runtime.lastError) {
            console.error('Error sending message to tab:', chrome.runtime.lastError.message);
          } else {
            console.log('Message sent successfully to tab, response:', result);
          }
        });
      } else {
        console.warn('Cannot send HINT_UPDATE: tabId is missing', { tabId, response });
      }
    }).catch(err => {
      console.error('Error in analyzeCode promise chain:', err);
    });
  });
}

// ⭐ Helper: save structured hints + append to persistent history
async function saveHintsToStorage(analysis: any, problemTitle: string) {
  const hints = (analysis?.hints || []).map((h: any, i: number) => ({
    id: Date.now() + i,
    message: typeof h === 'string' ? h : h.message || '',
    type: h.type || 'logic',
    severity: h.severity || 'medium',
    timestamp: Date.now(),
    problemTitle
  }));

  // Save as latestHints
  await chrome.storage.local.set({ latestHints: hints });

  // Append to hintHistory (keep last 50)
  const stored = await chrome.storage.local.get(['hintHistory']);
  const history: any[] = stored.hintHistory || [];
  const updated = [...hints, ...history].slice(0, 50);
  await chrome.storage.local.set({ hintHistory: updated });

  // Update progress: increment hintsUsed count for this problem
  const progressStore = await chrome.storage.local.get(['userProgress', 'currentProblem']);
  const userProgress = progressStore.userProgress || {};
  const cp = progressStore.currentProblem;
  if (cp?.id) {
    const existing = userProgress[cp.id] || { attempts: 0, hintsUsed: [], timeSpent: 0, lastAttempt: null, solved: false, difficulty: 'unknown' };
    existing.hintsUsed = [...(existing.hintsUsed || []), Date.now()];
    existing.lastAttempt = Date.now();
    userProgress[cp.id] = existing;
    await chrome.storage.local.set({ userProgress });
  }
}

// Handle progress saving
function handleProgressSave(data: any) {
  chrome.storage.local.get(['userProgress'], (result) => {
    const userProgress = result.userProgress || {};

    if (!userProgress[data.problemId]) {
      userProgress[data.problemId] = {
        attempts: 0,
        hintsUsed: [],
        timeSpent: 0,
        lastAttempt: null
      };
    }

    userProgress[data.problemId].attempts += 1;
    userProgress[data.problemId].lastAttempt = Date.now();

    if (data.hintsUsed) {
      userProgress[data.problemId].hintsUsed = [
        ...new Set([...userProgress[data.problemId].hintsUsed, ...data.hintsUsed])
      ];
    }

    chrome.storage.local.set({ userProgress });
    console.log('Progress saved:', userProgress[data.problemId]);
  });
}

function handleSignal(data: any, tabId?: number) {
  console.log('Signal captured:', data);

  apiService.sendSignal(data).then(response => {
    console.log('Signal response:', response);

    if (tabId) {
      chrome.tabs.sendMessage(tabId, {
        type: 'HINT_UPDATE',
        data: response
      });
    }

  }).catch(err => {
    console.error('Signal API error:', err);
  });
}


// Handle tab updates to inject content script
chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const supportedSites = [
      'leetcode.com',
      'geeksforgeeks.org',
      'hackerrank.com',
      'codeforces.com',
      'atcoder.jp'
    ];

    const isSupported = supportedSites.some(site => tab.url?.includes(site));

    if (isSupported) {
      console.log('Supported coding platform detected:', tab.url);
      // Content script will be automatically injected via manifest
    }
  }
});

export { };
