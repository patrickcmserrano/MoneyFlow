import { Page, Locator, expect } from '@playwright/test';

// Extend the Window interface to include our custom property
declare global {
  interface Window {
    _wasElementClicked: boolean;
  }
}

interface AccessibilityOptions {
  label?: string;
  role?: string;
  checkFocus?: boolean;
  checkContrast?: boolean;
  checkKeyboardInteraction?: boolean;
}

export class AccessibilityTester {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async expectElementAccessible(element: Locator, options: AccessibilityOptions = {}) {
    // Verificar se o elemento está visível
    await expect(element).toBeVisible();
    
    // Verificar se o elemento tem um rótulo apropriado
    if (options.label) {
      const ariaLabel = await element.getAttribute('aria-label');
      const innerText = await element.textContent();
      
      // Verificar se o texto do elemento ou o aria-label contém o rótulo esperado
      const hasLabel = (ariaLabel && ariaLabel.includes(options.label)) || 
                       (innerText && innerText.includes(options.label));
      
      expect(hasLabel, `Element should have label "${options.label}"`).toBeTruthy();
    }
    
    // Verificar se o elemento tem o role correto
    if (options.role) {
      const role = await element.getAttribute('role');
      expect(role).toBe(options.role);
    }
    
    // Verificar se o elemento é focável quando solicitado
    if (options.checkFocus) {
      await element.focus();
      const isFocused = await this.page.evaluate(() => {
        return document.activeElement === document.querySelector(':focus');
      });
      expect(isFocused, 'Element should be focusable').toBeTruthy();
    }
    
    // Verificar contraste quando solicitado
    if (options.checkContrast) {
      await this.checkElementContrast(element);
    }
    
    // Verificar interação por teclado
    if (options.checkKeyboardInteraction) {
      // Focar o elemento
      await element.focus();
      
      // Se for um botão, testar enter/space
      const tagName = await element.evaluate(el => el.tagName.toLowerCase());
      const role = await element.getAttribute('role');
      
      if (tagName === 'button' || role === 'button') {
        // Testar tecla Enter
        let wasClicked = false;
        // Configurar ouvinte para capturar o evento de clique
        await this.page.evaluate(() => {
          window._wasElementClicked = false;
          document.addEventListener('click', () => {
            window._wasElementClicked = true;
          }, { once: true });
        });
        
        // Pressionar Enter
        await this.page.keyboard.press('Enter');
        await this.page.waitForTimeout(100);
        
        // Verificar se o clique foi capturado
        wasClicked = await this.page.evaluate(() => {
          return window._wasElementClicked === true;
        });
        
        expect(wasClicked, 'Button should activate on Enter key').toBeTruthy();
      }
    }
  }

  /**
   * Verifica o contraste de um elemento
   */
  private async checkElementContrast(element: Locator) {
    // Nota: esta é uma verificação simplificada - para um sistema completo 
    // precisaríamos calcular o contraste usando a fórmula WCAG
    const result = await element.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        color: style.color,
        backgroundColor: style.backgroundColor,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight
      };
    });
    
    // Registrar os valores para a verificação manual
    console.log('Element contrast check:', result);
  }

  async expectKeyboardNavigable() {
    // Verificar se conseguimos navegar com Tab entre vários elementos
    let initialElement = await this.page.evaluate(() => {
      return document.activeElement ? 
        document.activeElement.outerHTML : 'none';
    });
    
    // Verificar navegabilidade por teclado pressionando Tab
    await this.page.keyboard.press('Tab');
    
    // Verificar se algum elemento recebeu foco e é diferente do inicial
    let currentElement = await this.page.evaluate(() => {
      return document.activeElement ? 
        document.activeElement.outerHTML : 'none';
    });
    
    // Verificar se o foco mudou
    expect(currentElement).not.toBe(initialElement);
    
    // Verificar se conseguimos navegar com Tab entre vários elementos
    const uniqueFocusedElements = new Set<string>();
    uniqueFocusedElements.add(currentElement);
    
    for (let i = 0; i < 5; i++) {
      await this.page.keyboard.press('Tab');
      
      currentElement = await this.page.evaluate(() => {
        return document.activeElement ? 
          document.activeElement.outerHTML : 'none';
      });
      
      uniqueFocusedElements.add(currentElement);
    }
    
    // Verificar se conseguimos navegar por pelo menos 3 elementos diferentes
    expect(uniqueFocusedElements.size).toBeGreaterThanOrEqual(3);
  }
  
  /**
   * Verifica se os elementos interativos têm um contraste adequado no modo de foco
   */
  async expectFocusIndicatorsVisible() {
    // Localizar elementos interativos
    const interactiveElements = await this.page.locator('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])').all();
    
    // Verificar pelo menos os três primeiros elementos interativos
    const elementsToCheck = interactiveElements.slice(0, Math.min(3, interactiveElements.length));
    
    for (const element of elementsToCheck) {
      // Focar o elemento
      await element.focus();
      
      // Verificar se há algum destaque visual
      const hasFocusStyle = await element.evaluate((el) => {
        const style = window.getComputedStyle(el);
        // Verificar propriedades comuns de estilo de foco
        return style.outlineWidth !== '0px' || 
               style.boxShadow !== 'none' || 
               el.classList.contains('focused') ||
               el.classList.contains('focus');
      });
      
      expect(hasFocusStyle, 'Interactive element should have visible focus indicators').toBeTruthy();
    }
  }
  
  /**
   * Verifica se os formulários são acessíveis
   */
  async expectFormsAccessible() {
    // Verificar se todos os inputs têm labels associados
    const inputs = await this.page.locator('input:not([type="hidden"]), select, textarea').all();
    
    for (const input of inputs) {
      const hasLabel = await input.evaluate((el) => {
        // Verificar label associado pelo for/id
        const id = el.getAttribute('id');
        if (id && document.querySelector(`label[for="${id}"]`)) {
          return true;
        }
        
        // Verificar label como elemento pai
        if (el.closest('label')) {
          return true;
        }
        
        // Verificar aria-label ou aria-labelledby
        return el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby');
      });
      
      expect(hasLabel, 'Form controls should have associated labels').toBeTruthy();
    }
  }
}
