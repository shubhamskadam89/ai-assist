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
      handleSignalCapture(message.data, sender.tab?.id);
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
            const analysis = await apiService.analyzeCode(code, language, problemId)
            sendResponse(analysis)
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

function handleSignalCapture(data: any, tabId?: number) {
  console.log('Signal captured:', data);

  // Call backend API
  apiService.sendSignal(data).then(response => {
    console.log('Received hint response:', response);
    if (tabId) {
      chrome.tabs.sendMessage(tabId, {
        type: 'HINT_UPDATE',
        data: response
      });
    }
  }).catch(err => {
    console.error('Error sending signal:', err);
  });
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
