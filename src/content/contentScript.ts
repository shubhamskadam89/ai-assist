// Content script for CodeMentor extension
console.log('CodeMentor content script loaded');

interface CodeEditor {
  element: HTMLElement;
  getValue: () => string;
  setValue: (value: string) => void;
  on: (event: string, callback: Function) => void;
  off: (event: string, callback: Function) => void;
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
  private debounceTimer: number | null = null;
  private lastCapturedCode = '';

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
    // Look for Monaco editor container
    const monacoContainer = document.querySelector('.monaco-editor') as HTMLElement;
    if (monacoContainer) {
      return monacoContainer;
    }
    
    // Look for Monaco editor in iframe
    const iframe = document.querySelector('iframe[src*="monaco"]') as HTMLIFrameElement;
    if (iframe) {
      return iframe.contentDocument?.querySelector('.monaco-editor') as HTMLElement || null;
    }
    
    return null;
  }

  private findCodeMirrorEditor(): HTMLElement | null {
    return document.querySelector('.CodeMirror') as HTMLElement;
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
    console.log('Setting up Monaco editor');
    
    // Monaco editor is typically available globally
    const monaco = (window as any).monaco;
    if (monaco) {
      const editor = monaco.editor.getEditors()[0];
      if (editor) {
        this.currentEditor = {
          element,
          getValue: () => editor.getValue(),
          setValue: (value: string) => editor.setValue(value),
          on: (event: string, callback: Function) => {
            if (event === 'change') {
              editor.onDidChangeModelContent(() => callback());
            }
          },
          off: () => {} // Monaco doesn't have off method
        };
        
        this.setupEditorListeners();
      }
    }
  }

  private setupCodeMirrorEditor(element: HTMLElement): void {
    console.log('Setting up CodeMirror editor');
    
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
    
    this.currentEditor.on('change', () => {
      this.debouncedCodeCapture();
    });
    
    console.log('Editor listeners setup complete');
  }

  private debouncedCodeCapture(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    this.debounceTimer = window.setTimeout(() => {
      this.captureCode();
    }, 500); // 500ms debounce
  }

  private captureCode(): void {
    if (!this.currentEditor) return;
    
    const code = this.currentEditor.getValue();
    if (code === this.lastCapturedCode) return; // No change
    
    this.lastCapturedCode = code;
    
    const problemInfo = this.extractProblemInfo();
    
    // Send to background script
    chrome.runtime.sendMessage({
      type: 'CAPTURE_CODE',
      data: {
        code,
        language: this.detectLanguage(),
        problemId: problemInfo.id,
        problemTitle: problemInfo.title,
        platform: problemInfo.platform,
        timestamp: Date.now()
      }
    });
    
    console.log('Code captured and sent:', { code: code.substring(0, 100) + '...' });
  }

  private extractProblemInfo(): ProblemInfo {
    // Extract problem information based on platform
    const hostname = window.location.hostname;
    let id = 'unknown';
    let title = 'Unknown Problem';
    let difficulty = 'unknown';
    
    if (hostname.includes('leetcode.com')) {
      const titleElement = document.querySelector('[data-cy="question-title"]') || 
                          document.querySelector('.css-v3d350');
      title = titleElement?.textContent?.trim() || 'LeetCode Problem';
      id = `leetcode_${title.toLowerCase().replace(/\s+/g, '_')}`;
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
            <div class="hints-list">
              <div class="hint-item">
                <div class="hint-type syntax">Syntax</div>
                <div class="hint-message">Looks like you forgot a semicolon at the end of line 5.</div>
              </div>
              <div class="hint-item">
                <div class="hint-type logic">Logic</div>
                <div class="hint-message">Check your loop bounds; you may be iterating one step too far.</div>
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

  private toggleOverlay(): void {
    if (!this.overlayContainer) return;
    
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

export {};
