// Content script for CodeMentor extension
console.log('CodeMentor content script loaded');

interface CodeEditor {
  element: HTMLElement;
  getValue: () => string;
  setValue: (value: string) => void;
  on: (event: string, callback: Function) => void;
  off: (event: string, callback: Function) => void;
}


interface SignalVector {
  hasRecursion: boolean;
  hasDPArray: boolean;
  hasMemo: boolean;
  usesSort: boolean;
  loopDepth: number;
}

interface ProblemInfo {
  id: string;
  title: string;
  difficulty: string;
  platform: string;
}


class CodeCaptureService {
  private currentEditor: CodeEditor | null = null;
  private overlayContainer: HTMLElement | null = null;
  private isOverlayVisible = false;
  private pollingTimer: number | null = null;
  private lastCapturedCode = '';
  private enabled = true;
  private sessionId: string | null = null;


  constructor() {
    this.init();
  }

  private init() {
    // Wait for page to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  private setup() {
    console.log('Setting up CodeMentor content script');
    // Generate stable session ID
    this.sessionId = 'session-' + Math.random().toString(36).slice(2);
    // Load initial enabled setting
    try {
      chrome.storage?.local.get(['settings'], (result) => {
        if (result?.settings && typeof result.settings.enabled === 'boolean') {
          this.enabled = result.settings.enabled
          if (!this.enabled) {
            // If disabled, ensure overlay is hidden
            this.isOverlayVisible = false
            if (this.overlayContainer) {
              const content = this.overlayContainer.querySelector('.codementor-content') as HTMLElement
              if (content) content.style.display = 'none'
            }
          }
        }
      })
    } catch { }

    // Detect the coding platform
    this.detectPlatform();

    // Find and setup code editor
    this.findCodeEditor();

    // Create overlay UI
    this.createOverlay();

    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();

    // Listen for page changes (SPA navigation)
    this.observePageChanges();

    // Listen for toggle messages
    // Listen for toggle messages
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg?.type === 'TOGGLE_EXTENSION') {
        this.enabled = !!msg.enabled
        // Show/hide overlay content accordingly
        if (this.overlayContainer) {
          const content = this.overlayContainer.querySelector('.codementor-content') as HTMLElement
          const toggleBtn = this.overlayContainer.querySelector('#codementor-toggle') as HTMLElement
          if (content && toggleBtn) {
            if (this.enabled) {
              content.style.display = 'block'
              toggleBtn.textContent = '−'
              this.isOverlayVisible = true
              this.startPolling();
            } else {
              content.style.display = 'none'
              toggleBtn.textContent = '+'
              this.isOverlayVisible = false
              this.stopPolling();
            }
          }
        }
      } else if (msg?.type === 'HINT_UPDATE') {
        this.updateHints(msg.data);
      }
    });

    // Start polling if enabled
    if (this.enabled) {
      this.startPolling();
    }
  }

  private detectPlatform(): void {
    const hostname = window.location.hostname;
    let platform = 'unknown';

    if (hostname.includes('leetcode.com')) {
      platform = 'leetcode';
    } else if (hostname.includes('geeksforgeeks.org')) {
      platform = 'geeksforgeeks';
    } else if (hostname.includes('hackerrank.com')) {
      platform = 'hackerrank';
    } else if (hostname.includes('codeforces.com')) {
      platform = 'codeforces';
    } else if (hostname.includes('atcoder.jp')) {
      platform = 'atcoder';
    }

    console.log('Detected platform:', platform);
  }

  private findCodeEditor(): void {
    // Try to find Monaco Editor (VS Code style)
    const monacoEditor = this.findMonacoEditor();
    if (monacoEditor) {
      this.setupMonacoEditor(monacoEditor);
      return;
    }

    // Try to find CodeMirror editor
    const codeMirrorEditor = this.findCodeMirrorEditor();
    if (codeMirrorEditor) {
      this.setupCodeMirrorEditor(codeMirrorEditor);
      return;
    }

    // Try to find textarea-based editor
    const textareaEditor = this.findTextareaEditor();
    if (textareaEditor) {
      this.setupTextareaEditor(textareaEditor);
      return;
    }

    console.log('No code editor found, retrying in 1 second...');
    setTimeout(() => this.findCodeEditor(), 1000);
  }

  private findMonacoEditor(): HTMLElement | null {
    // Look for standard Monaco editor class
    const monacoEditor = document.querySelector('.monaco-editor');
    if (monacoEditor) return monacoEditor as HTMLElement;

    // Look for LeetCode specific containers or view-lines
    const viewLines = document.querySelector('.view-lines');
    if (viewLines) return viewLines.closest('.monaco-editor') as HTMLElement || viewLines as HTMLElement;

    // Look for data attributes
    const dataEditor = document.querySelector('[data-cy="code-editor"]');
    if (dataEditor) return dataEditor as HTMLElement;

    return null;
  }

  private findCodeMirrorEditor(): HTMLElement | null {
    // CodeMirror 5
    const cm5 = document.querySelector('.CodeMirror');
    if (cm5) return cm5 as HTMLElement;

    // CodeMirror 6
    const cm6 = document.querySelector('.cm-content');
    if (cm6) return cm6 as HTMLElement;

    // Generic contenteditable (fallback)
    const generic = document.querySelector('[contenteditable="true"]');
    if (generic && generic.closest('.editor-scrollable')) return generic as HTMLElement;

    return null;
  }

  private findTextareaEditor(): HTMLTextAreaElement | null {
    // Look for textarea with code-like content
    const textareas = document.querySelectorAll('textarea');
    for (const textarea of textareas) {
      if (textarea.placeholder?.toLowerCase().includes('code') ||
        textarea.className.includes('code') ||
        textarea.id.includes('code')) {
        return textarea;
      }
    }
    return null;
  }

  private setupMonacoEditor(element: HTMLElement): void {
    console.log('Setting up Monaco editor (DOM Scraping Mode)');

    // In a content script, we cannot access window.monaco due to isolation.
    // We must scrape the DOM or inject a script. For read-only signals, scraping is sufficient.

    this.currentEditor = {
      element,
      getValue: () => {
        // Scrape text from .view-line elements
        // They are usually divs with text content
        const lines = element.querySelectorAll('.view-line');
        if (lines.length > 0) {
          // Join text content of lines. 
          // Note: Monaco renders parts of lines in spans. textContent of the line div usually works.
          // But we need to be careful about ordering (top style attribute).
          // Usually querySelectorAll returns in document order, which is correct for lines.
          return Array.from(lines).map(line => {
            // Ensure we get text (some versions use structure like <span><span>code</span></span>)
            return line.textContent || '';
          }).join('\n');
        }

        // Fallback: Try to find a textarea usage?
        const textarea = element.querySelector('textarea.inputarea') as HTMLTextAreaElement;
        if (textarea) return textarea.value;

        return '';
      },
      setValue: (_value: string) => {
        console.warn('setValue not supported in scraping mode');
      },
      on: (_event: string, _callback: Function) => {
        // We cannot listen to Monaco model events directly.
        // We will rely on our polling mechanism in startPolling().
      },
      off: (_event: string, _callback: Function) => { }
    };

    // We don't need setupEditorListeners anymore since we rely on polling
    console.log('Monaco editor setup complete');
  }

  private setupCodeMirrorEditor(element: HTMLElement): void {
    console.log('Setting up CodeMirror/Generic editor');

    // Check if it's CM6 or generic contenteditable
    if (element.classList.contains('cm-content') || element.getAttribute('contenteditable') === 'true') {
      this.currentEditor = {
        element,
        getValue: () => {
          // For CM6, text is in .cm-line elements
          const lines = element.querySelectorAll('.cm-line');
          if (lines.length > 0) {
            return Array.from(lines).map(line => line.textContent || '').join('\n');
          }
          // Fallback for generic contenteditable
          return element.innerText || element.textContent || '';
        },
        setValue: (_value: string) => {
          console.warn('setValue not supported for scraped editor');
        },
        on: () => { },
        off: () => { }
      };
      console.log('CodeMirror 6 / Generic setup complete');
      this.setupEditorListeners();
      return;
    }

    // CodeMirror 5 (Legacy)
    const codeMirror = (element as any).CodeMirror;
    if (codeMirror) {
      this.currentEditor = {
        element,
        getValue: () => codeMirror.getValue(),
        setValue: (value: string) => codeMirror.setValue(value),
        on: (event: string, callback: Function) => codeMirror.on(event, callback),
        off: (event: string, callback: Function) => codeMirror.off(event, callback)
      };

      this.setupEditorListeners();
    }
  }

  private setupTextareaEditor(element: HTMLTextAreaElement): void {
    console.log('Setting up textarea editor');

    this.currentEditor = {
      element,
      getValue: () => element.value,
      setValue: (value: string) => { element.value = value; },
      on: (event: string, callback: Function) => {
        if (event === 'change') {
          element.addEventListener('input', callback as EventListener);
        }
      },
      off: (event: string, callback: Function) => {
        if (event === 'change') {
          element.removeEventListener('input', callback as EventListener);
        }
      }
    };

    this.setupEditorListeners();
  }

  private setupEditorListeners(): void {
    if (!this.currentEditor) return;

    // We don't need change listeners anymore since we are polling
    // But we might want to reset the polling timer on activity to avoid idle waste?
    // For now, simple polling is enough as per requirement.
    console.log('Editor listeners setup complete (Polling mode)');
  }

  private startPolling(): void {
    if (this.pollingTimer) clearInterval(this.pollingTimer);

    // Poll every 5 seconds
    this.pollingTimer = window.setInterval(() => {
      this.captureSignal();
    }, 5000);
  }

  private stopPolling(): void {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  private captureSignal(): void {
    if (!this.enabled || !this.currentEditor) return;

    try {
      const code = this.currentEditor.getValue();
      // Optimization: Skip if code matches last captured.
      if (code === this.lastCapturedCode) return;

      this.lastCapturedCode = code;

      const problemInfo = this.extractProblemInfo();
      const signals = this.extractSignals(code);

      // Check if extension context is valid
      if (!chrome.runtime?.id) {
        console.warn('Extension context invalidated, stopping polling');
        this.stopPolling();
        return;
      }

      // Send to background script
      chrome.runtime.sendMessage({
        type: 'CAPTURE_SIGNAL',
        data: {
          sessionId: this.sessionId,
          problemId: problemInfo.id,
          language: this.detectLanguage(),
          signals: signals
        }
      });

      console.log('Signal captured and sent:', signals);
    } catch (error) {
      console.error('Error during signal capture:', error);
      // Stop polling if we hit a critical error (like context invalidation)
      if (error instanceof Error && error.message.includes('Extension context invalidated')) {
        this.stopPolling();
      }
    }
  }

  private extractSignals(code: string): SignalVector {
    // Basic heuristics
    const hasRecursion = /func\s+(\w+).*?\1\(|def\s+(\w+).*?\2\(|void\s+(\w+).*?\3\(|int\s+(\w+).*?\4\(/.test(code);
    const hasDPArray = /dp\[|memo\[|cache\[/.test(code) || /vector<.*> dp/.test(code) || /int\[\].*dp/.test(code);
    const hasMemo = /memo\s*=|cache\s*=|Map<.*>/.test(code);
    const usesSort = /\.sort\(|sorted\(|Arrays\.sort\(|Collections\.sort\(/.test(code);

    // Estimate loop depth
    let maxDepth = 0;
    let currentDepth = 0;
    const lines = code.split('\n');

    for (const line of lines) {
      // Naive counting of braces
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;

      currentDepth += openBraces;
      currentDepth -= closeBraces;

      if (currentDepth > maxDepth) maxDepth = currentDepth;
    }

    // Fallback: If no braces (Python?), look for indentation? 
    // This is tricky. For now, rely on minimal signals.

    return {
      hasRecursion,
      hasDPArray,
      hasMemo,
      usesSort,
      loopDepth: Math.min(maxDepth, 5) // Cap at 5
    };
  }

  private extractProblemInfo(): ProblemInfo {
    // Extract problem information based on platform
    const hostname = window.location.hostname;
    let id = 'unknown';
    let title = 'Unknown Problem';
    let difficulty = 'unknown';

    if (hostname.includes('leetcode.com')) {
      // Robust regex that handles potential missing trailing slash
      const urlMatch = window.location.pathname.match(/problems\/([^/]+)/);
      const slug = urlMatch?.[1] || 'unknown';

      // Map slug → problem number (TEMP: hardcode Coin Change)
      // Coin Change = 322
      if (slug === 'coin-change') {
        id = 'leetcode_322';
      } else if (slug === 'two-sum') {
        id = 'leetcode_1';
      } else {
        id = `leetcode_${slug}`;
      }

      const titleElement = document.querySelector('[data-cy="question-title"]') ||
        document.querySelector('.css-v3d350');
      title = titleElement?.textContent?.trim() || 'LeetCode Problem';
    } else if (hostname.includes('geeksforgeeks.org')) {
      const titleElement = document.querySelector('.problem-statement h1') ||
        document.querySelector('.gfg_h1');
      title = titleElement?.textContent?.trim() || 'GeeksforGeeks Problem';
      id = `gfg_${title.toLowerCase().replace(/\s+/g, '_')}`;
    } else if (hostname.includes('hackerrank.com')) {
      const titleElement = document.querySelector('.challenge-title') ||
        document.querySelector('h1');
      title = titleElement?.textContent?.trim() || 'HackerRank Problem';
      id = `hackerrank_${title.toLowerCase().replace(/\s+/g, '_')}`;
    }

    return {
      id,
      title,
      difficulty,
      platform: hostname
    };
  }

  private detectLanguage(): string {
    // Try to detect programming language from editor or page
    const code = this.currentEditor?.getValue() || '';

    if (code.includes('def ') || code.includes('import ')) return 'python';
    if (code.includes('function ') || code.includes('const ') || code.includes('let ')) return 'javascript';
    if (code.includes('public class') || code.includes('import java')) return 'java';
    if (code.includes('#include') || code.includes('using namespace')) return 'cpp';
    if (code.includes('package ') || code.includes('func ')) return 'go';

    return 'unknown';
  }

  private injectStyles(): void {
    // Check if styles are already injected
    if (document.getElementById('codementor-styles')) return;

    // Create style element
    const styleElement = document.createElement('style');
    styleElement.id = 'codementor-styles';
    styleElement.textContent = `
      /* CodeMentor Content Script Styles */
      #codementor-overlay {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 350px;
        max-height: 80vh;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        border-radius: 12px;
        background: white;
        border: 1px solid #e5e7eb;
        overflow: hidden;
        animation: slideIn 0.3s ease-out;
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      .codementor-panel {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .codementor-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        color: white;
        border-bottom: 1px solid #e5e7eb;
      }

      .codementor-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }

      .codementor-toggle-btn {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s;
      }

      .codementor-toggle-btn:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      .codementor-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
      }

      .codementor-tabs {
        display: flex;
        border-bottom: 1px solid #e5e7eb;
        background: #f9fafb;
      }

      .tab-btn {
        flex: 1;
        padding: 12px 16px;
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        color: #6b7280;
        transition: all 0.2s;
        border-bottom: 2px solid transparent;
      }

      .tab-btn:hover {
        background: #f3f4f6;
        color: #374151;
      }

      .tab-btn.active {
        color: #3b82f6;
        border-bottom-color: #3b82f6;
        background: white;
      }

      .tab-content {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        max-height: 400px;
      }

      /* Hints Tab */
      .hints-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .hint-item {
        padding: 16px;
        border-radius: 8px;
        border: 1px solid #e5e7eb;
        background: #f9fafb;
        transition: all 0.2s;
      }

      .hint-item:hover {
        border-color: #3b82f6;
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
      }

      .hint-type {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        margin-bottom: 8px;
      }

      .hint-type.syntax {
        background: #fef3c7;
        color: #92400e;
      }

      .hint-type.logic {
        background: #dbeafe;
        color: #1e40af;
      }

      .hint-type.performance {
        background: #f3e8ff;
        color: #7c3aed;
      }

      .hint-type.best-practice {
        background: #d1fae5;
        color: #065f46;
      }

      .hint-message {
        font-size: 14px;
        color: #374151;
        line-height: 1.5;
      }

      /* Progress Tab */
      .progress-stats {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .stat-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: #f9fafb;
        border-radius: 8px;
        border: 1px solid #e5e7eb;
      }

      .stat-label {
        font-size: 14px;
        color: #6b7280;
        font-weight: 500;
      }

      .stat-value {
        font-size: 16px;
        color: #374151;
        font-weight: 600;
      }

      /* Settings Tab */
      .settings-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .setting-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: #f9fafb;
        border-radius: 8px;
        border: 1px solid #e5e7eb;
        cursor: pointer;
        transition: all 0.2s;
      }

      .setting-item:hover {
        border-color: #3b82f6;
        background: #f0f9ff;
      }

      .setting-item input[type="checkbox"] {
        width: 16px;
        height: 16px;
        accent-color: #3b82f6;
      }

      .setting-item span {
        font-size: 14px;
        color: #374151;
        font-weight: 500;
      }

      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        #codementor-overlay {
          background: #1f2937;
          border-color: #374151;
          color: #f9fafb;
        }
        
        .codementor-header {
          background: linear-gradient(135deg, #1e40af, #1e3a8a);
        }
        
        .codementor-tabs {
          background: #111827;
          border-color: #374151;
        }
        
        .tab-btn {
          color: #9ca3af;
        }
        
        .tab-btn:hover {
          background: #374151;
          color: #f9fafb;
        }
        
        .tab-btn.active {
          color: #60a5fa;
          background: #1f2937;
        }
        
        .hint-item,
        .stat-item,
        .setting-item {
          background: #111827;
          border-color: #374151;
        }
        
        .hint-message,
        .stat-label,
        .setting-item span {
          color: #d1d5db;
        }
        
        .stat-value {
          color: #f9fafb;
        }
      }

      /* Responsive design */
      @media (max-width: 768px) {
        #codementor-overlay {
          width: 300px;
          right: 10px;
          top: 10px;
        }
        
        .codementor-header {
          padding: 12px 16px;
        }
        
        .codementor-header h3 {
          font-size: 16px;
        }
        
        .tab-content {
          padding: 16px;
        }
      }

      /* Scrollbar styling */
      .tab-content::-webkit-scrollbar {
        width: 6px;
      }

      .tab-content::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 3px;
      }

      .tab-content::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
      }

      .tab-content::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }
    `;

    document.head.appendChild(styleElement);
    console.log('CodeMentor styles injected');
  }

  private createOverlay(): void {
    // Inject CSS styles
    this.injectStyles();

    // Create overlay container
    this.overlayContainer = document.createElement('div');
    this.overlayContainer.id = 'codementor-overlay';
    this.overlayContainer.innerHTML = `
      <div class="codementor-panel">
        <div class="codementor-header">
          <h3>CodeMentor</h3>
          <button id="codementor-toggle" class="codementor-toggle-btn">−</button>
        </div>
        <div class="codementor-content">
          <div class="codementor-tabs">
            <button class="tab-btn active" data-tab="hints">Hints</button>
            <button class="tab-btn" data-tab="progress">Progress</button>
            <button class="tab-btn" data-tab="settings">Settings</button>
          </div>
          <div class="tab-content" id="hints-content">
            <div class="hints-list" id="hints-list-container">
              <div class="hint-item">
                <div class="hint-message">Analyze code to get real-time hints...</div>
              </div>
            </div>
          </div>
          <div class="tab-content" id="progress-content" style="display: none;">
            <div class="progress-stats">
              <div class="stat-item">
                <span class="stat-label">Attempts:</span>
                <span class="stat-value">3</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Hints Used:</span>
                <span class="stat-value">2</span>
              </div>
            </div>
          </div>
          <div class="tab-content" id="settings-content" style="display: none;">
            <div class="settings-list">
              <label class="setting-item">
                <input type="checkbox" checked>
                <span>Enable Hints</span>
              </label>
              <label class="setting-item">
                <input type="checkbox" checked>
                <span>Auto Capture Code</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.overlayContainer);

    // Setup overlay event listeners
    this.setupOverlayListeners();

    console.log('Overlay created and attached');
  }

  private setupOverlayListeners(): void {
    if (!this.overlayContainer) return;

    // Toggle button
    const toggleBtn = this.overlayContainer.querySelector('#codementor-toggle');
    toggleBtn?.addEventListener('click', () => {
      this.toggleOverlay();
    });

    // Tab buttons
    const tabBtns = this.overlayContainer.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = (e.target as HTMLElement).dataset.tab;
        if (tab) this.switchTab(tab);
      });
    });
  }

  private updateHints(hintResponse: any): void {
    console.log('HINT RESPONSE RECEIVED:', hintResponse);
    const container = this.overlayContainer?.querySelector('#hints-list-container');
    if (!container) return;

    container.innerHTML = '';

    if (!hintResponse || !hintResponse.showHint) {
      container.innerHTML = '<div class="hint-item"><div class="hint-message">No specific hints yet. Keep going!</div></div>';
      return;
    }

    const div = document.createElement('div');
    div.className = 'hint-item';

    const typeDiv = document.createElement('div');
    typeDiv.className = `hint-type ${hintResponse.level?.toLowerCase() || 'info'}`;
    typeDiv.textContent = hintResponse.level || 'Hint';

    const msgDiv = document.createElement('div');
    msgDiv.className = 'hint-message';
    msgDiv.textContent = hintResponse.message || '';

    div.appendChild(typeDiv);
    div.appendChild(msgDiv);
    container.appendChild(div);

    // Auto-show overlay if high priority?
    // if (hintResponse.level === 'CRITICAL' && !this.isOverlayVisible) { ... }
  }

  private toggleOverlay(): void {
    if (!this.overlayContainer) return;

    if (!this.enabled) return;
    this.isOverlayVisible = !this.isOverlayVisible;
    const content = this.overlayContainer.querySelector('.codementor-content') as HTMLElement;
    const toggleBtn = this.overlayContainer.querySelector('#codementor-toggle') as HTMLElement;

    if (this.isOverlayVisible) {
      content.style.display = 'block';
      toggleBtn.textContent = '−';
    } else {
      content.style.display = 'none';
      toggleBtn.textContent = '+';
    }
  }

  private switchTab(tabName: string): void {
    if (!this.overlayContainer) return;

    // Update tab buttons
    const tabBtns = this.overlayContainer.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));
    this.overlayContainer.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');

    // Update tab content
    const tabContents = this.overlayContainer.querySelectorAll('.tab-content');
    tabContents.forEach(content => (content as HTMLElement).style.display = 'none');
    const activeContent = this.overlayContainer.querySelector(`#${tabName}-content`) as HTMLElement;
    if (activeContent) activeContent.style.display = 'block';
  }

  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Shift + M to toggle overlay
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        this.toggleOverlay();
      }
    });
  }

  private observePageChanges(): void {
    // Watch for URL changes (SPA navigation)
    let currentUrl = window.location.href;

    const observer = new MutationObserver(() => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        console.log('Page changed, reinitializing...');
        setTimeout(() => {
          this.findCodeEditor();
        }, 1000);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Initialize the content script
new CodeCaptureService();

export { };
