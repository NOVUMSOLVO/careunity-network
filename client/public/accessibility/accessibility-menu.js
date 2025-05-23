/**
 * CareUnity Network Accessibility Menu Component
 * 
 * This file provides a reusable accessibility menu component that can
 * be added to any page in the CareUnity Network application.
 */

class AccessibilityMenu extends HTMLElement {
  constructor() {
    super();
    
    // Create a shadow DOM
    this.attachShadow({ mode: 'open' });
    
    // Initialize state
    this.state = {
      highContrast: false,
      largeText: false,
      fontSize: 16,
      reduceMotion: false,
      screenReaderOptimized: false,
      focusIndicators: true
    };
  }
  
  async connectedCallback() {
    // Get saved preferences
    try {
      if (window.getAccessibilityPreferences) {
        const preferences = await window.getAccessibilityPreferences();
        if (preferences) {
          this.state = {
            ...this.state,
            ...preferences
          };
        }
      }
    } catch (err) {
      console.error('Error loading accessibility preferences:', err);
    }
    
    // Render the menu
    this.render();
    
    // Add event listeners
    this.addEventListeners();
  }
  
  render() {
    // HTML template
    const template = `
      <style>
        /* Import the main accessibility styles */
        @import url('/accessibility/accessibility-styles.css');
        
        /* Component-specific styles */
        :host {
          display: block;
        }
        
        .a11y-button {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--button-primary-bg, #0277bd);
          color: var(--button-primary-text, #ffffff);
          border: none;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          z-index: 9998;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .a11y-icon {
          width: 24px;
          height: 24px;
        }
        
        .a11y-menu {
          position: fixed;
          bottom: 80px;
          right: 20px;
          background: white;
          border: 1px solid #cccccc;
          border-radius: 4px;
          padding: 16px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          z-index: 9999;
          width: 280px;
          max-width: 90vw;
          max-height: 80vh;
          overflow-y: auto;
          display: none;
        }
        
        .a11y-menu.show {
          display: block;
        }
        
        h2 {
          margin-top: 0;
          margin-bottom: 16px;
          font-size: 18px;
        }
        
        .a11y-option {
          margin-bottom: 12px;
        }
        
        label {
          display: flex;
          align-items: center;
          font-size: 14px;
        }
        
        input[type="checkbox"] {
          margin-right: 8px;
        }
        
        .a11y-range {
          display: flex;
          flex-direction: column;
          margin-bottom: 12px;
        }
        
        .a11y-range-controls {
          display: flex;
          align-items: center;
        }
        
        input[type="range"] {
          flex-grow: 1;
          margin: 0 8px;
        }
        
        .a11y-buttons {
          display: flex;
          justify-content: space-between;
          margin-top: 16px;
        }
        
        button {
          padding: 8px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .a11y-save {
          background: var(--button-primary-bg, #0277bd);
          color: var(--button-primary-text, #ffffff);
        }
        
        .a11y-reset {
          background: var(--button-secondary-bg, #ffffff);
          color: var(--button-secondary-text, #0277bd);
          border: 1px solid var(--button-secondary-border, #0277bd);
        }
      </style>
      
      <button class="a11y-button" aria-label="Accessibility Options" title="Accessibility Options">
        <svg class="a11y-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"></path>
        </svg>
      </button>
      
      <div class="a11y-menu" role="dialog" aria-labelledby="a11y-title">
        <h2 id="a11y-title">Accessibility Options</h2>
        
        <div class="a11y-option">
          <label>
            <input type="checkbox" name="highContrast" ${this.state.highContrast ? 'checked' : ''}>
            High Contrast Mode
          </label>
        </div>
        
        <div class="a11y-option">
          <label>
            <input type="checkbox" name="largeText" ${this.state.largeText ? 'checked' : ''}>
            Large Text Mode
          </label>
        </div>
        
        <div class="a11y-range">
          <label for="fontSize">Text Size: ${this.state.fontSize}px</label>
          <div class="a11y-range-controls">
            <span>A</span>
            <input type="range" id="fontSize" name="fontSize" min="14" max="24" value="${this.state.fontSize}" step="1">
            <span>A</span>
          </div>
        </div>
        
        <div class="a11y-option">
          <label>
            <input type="checkbox" name="reduceMotion" ${this.state.reduceMotion ? 'checked' : ''}>
            Reduce Motion
          </label>
        </div>
        
        <div class="a11y-option">
          <label>
            <input type="checkbox" name="screenReaderOptimized" ${this.state.screenReaderOptimized ? 'checked' : ''}>
            Screen Reader Optimized
          </label>
        </div>
        
        <div class="a11y-option">
          <label>
            <input type="checkbox" name="focusIndicators" ${this.state.focusIndicators ? 'checked' : ''}>
            Keyboard Focus Indicators
          </label>
        </div>
        
        <div class="a11y-buttons">
          <button class="a11y-reset">Reset</button>
          <button class="a11y-save">Save</button>
        </div>
      </div>
    `;
    
    // Set the shadow DOM content
    this.shadowRoot.innerHTML = template;
  }
  
  addEventListeners() {
    // Get elements
    const button = this.shadowRoot.querySelector('.a11y-button');
    const menu = this.shadowRoot.querySelector('.a11y-menu');
    const saveButton = this.shadowRoot.querySelector('.a11y-save');
    const resetButton = this.shadowRoot.querySelector('.a11y-reset');
    const inputs = this.shadowRoot.querySelectorAll('input');
    const fontSizeInput = this.shadowRoot.querySelector('#fontSize');
    const fontSizeLabel = fontSizeInput.parentElement.previousElementSibling;
    
    // Toggle menu
    button.addEventListener('click', () => {
      menu.classList.toggle('show');
      if (menu.classList.contains('show')) {
        menu.setAttribute('aria-hidden', 'false');
      } else {
        menu.setAttribute('aria-hidden', 'true');
      }
    });
    
    // Close menu when clicked outside
    document.addEventListener('click', (event) => {
      const isClickInsideComponent = event.composedPath().includes(this);
      if (!isClickInsideComponent && menu.classList.contains('show')) {
        menu.classList.remove('show');
        menu.setAttribute('aria-hidden', 'true');
      }
    });
    
    // Font size range input
    fontSizeInput.addEventListener('input', () => {
      const value = fontSizeInput.value;
      fontSizeLabel.textContent = `Text Size: ${value}px`;
      this.state.fontSize = parseInt(value);
    });
    
    // Checkbox inputs
    inputs.forEach((input) => {
      if (input.type === 'checkbox') {
        input.addEventListener('change', () => {
          this.state[input.name] = input.checked;
        });
      }
    });
    
    // Save button
    saveButton.addEventListener('click', async () => {
      try {
        if (window.updateAccessibilityPreferences) {
          await window.updateAccessibilityPreferences(this.state);
          menu.classList.remove('show');
          menu.setAttribute('aria-hidden', 'true');
        } else {
          console.error('updateAccessibilityPreferences function not found');
        }
      } catch (err) {
        console.error('Error saving accessibility preferences:', err);
      }
    });
    
    // Reset button
    resetButton.addEventListener('click', () => {
      // Reset to defaults
      this.state = {
        highContrast: false,
        largeText: false,
        fontSize: 16,
        reduceMotion: false,
        screenReaderOptimized: false,
        focusIndicators: true
      };
      
      // Update UI to reflect reset values
      inputs.forEach((input) => {
        if (input.type === 'checkbox') {
          input.checked = this.state[input.name] || false;
        } else if (input.type === 'range') {
          input.value = this.state[input.name] || 16;
          fontSizeLabel.textContent = `Text Size: ${input.value}px`;
        }
      });
    });
    
    // Handle keyboard events for accessibility
    menu.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        menu.classList.remove('show');
        menu.setAttribute('aria-hidden', 'true');
        button.focus();
      }
    });
    
    // Initial ARIA state
    menu.setAttribute('aria-hidden', 'true');
  }
}

// Register the custom element
if (typeof customElements !== 'undefined') {
  customElements.define('accessibility-menu', AccessibilityMenu);
}
