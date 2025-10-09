// Background service worker for CodeMentor extension
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
    
    default:
      console.log('Unknown message type:', message.type);
  }
});

// Handle code capture from content script
function handleCodeCapture(data: any, _tabId?: number) {
  console.log('Code captured:', data);
  
  // Store the latest code for this problem
  chrome.storage.local.get(['currentProblem'], (result) => {
    const currentProblem = result.currentProblem || {};
    currentProblem[data.problemId] = {
      code: data.code,
      language: data.language,
      timestamp: Date.now()
    };
    
    chrome.storage.local.set({ currentProblem });
  });
  
  // TODO: Send to AI service when backend is ready
  // For now, we'll just log it
  console.log('Code ready for AI processing:', {
    problemId: data.problemId,
    code: data.code,
    language: data.language
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

export {};
