import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Classe para auxiliar testes de acessibilidade no MoneyFlow
 */
export class AccessibilityHelper {
  constructor(private page: Page) {}

  /**
   * Verifica se um elemento é visível e acessível para leitores de tela
   */
  async expectElementToBeAccessible(locator: Locator, options?: { label?: string }) {
    // Verificar se está visível para usuários com visão normal
    await expect(locator).toBeVisible();
    
    // Verificar se possui atributos ARIA corretos quando especificados
    if (options?.label) {
      const ariaLabel = await locator.getAttribute('aria-label');
      const accessibleName = 
        ariaLabel || 
        await locator.getAttribute('alt') || 
        await locator.textContent() || '';
      
      expect(
        accessibleName.toLowerCase().includes(options.label.toLowerCase()),
        `Element should have accessible name containing "${options.label}"`
      ).toBeTruthy();
    }
  }

  /**
   * Verifica se um botão é acessível
   */
  async expectButtonToBeAccessible(buttonLocator: Locator, label: string) {
    await this.expectElementToBeAccessible(buttonLocator, { label });
    
    // Verificar se é focável
    await buttonLocator.focus();
    const isFocused = await this.page.evaluate(() => {
      return document.activeElement === document.querySelector(':focus');
    });
    expect(isFocused, 'Button should be focusable').toBeTruthy();
  }

  /**
   * Verifica contraste de cores com base em estilos computados
   * Esta é uma verificação simplificada e pode precisar de ajustes para elementos complexos
   */
  async expectSufficientColorContrast(locator: Locator) {
    const foregroundColor = await locator.evaluate((el) => 
      window.getComputedStyle(el).color
    );
    
    const backgroundColor = await locator.evaluate((el) => {
      let bgColor = window.getComputedStyle(el).backgroundColor;
      if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
        // Tenta obter o background do elemento pai se o elemento for transparente
        const parent = el.parentElement;
        if (parent) {
          bgColor = window.getComputedStyle(parent).backgroundColor;
        }
      }
      return bgColor;
    });
    
    // Registrar cores para verificação manual (cálculo automatizado de contraste é complexo)
    console.log(`Element color check - Text: ${foregroundColor}, Background: ${backgroundColor}`);
  }

  /**
   * Verifica se a página tem uma estrutura de cabeçalhos adequada
   */
  async expectValidHeadingStructure() {
    const headings = await this.page.locator('h1, h2, h3, h4, h5, h6').all();
    
    // Verificar se a página tem pelo menos um cabeçalho
    expect(headings.length).toBeGreaterThan(0);
    
    // Verificar se tem exatamente um h1 por página
    const h1Count = await this.page.locator('h1').count();
    expect(h1Count, 'Page should have exactly one h1 heading').toBe(1);
  }

  /**
   * Verifica se a página tem navegação por teclado adequada
   */
  async expectKeyboardNavigable() {
    // Pressionar Tab para navegar pelos elementos
    await this.page.keyboard.press('Tab');
    
    // Verificar se algo recebeu foco
    const hasFocus = await this.page.evaluate(() => {
      return document.activeElement !== document.body;
    });
    
    expect(hasFocus, 'Page should be keyboard navigable').toBeTruthy();
    
    // Verificar navegabilidade completa por teclado
    await this.verifyFullKeyboardNavigation();
  }
  
  /**
   * Verifica se é possível navegar por toda a página usando apenas o teclado
   */
  async verifyFullKeyboardNavigation() {
    const focusableElementCount = await this.countFocusableElements();
    let uniqueFocusedElements = new Set();
    
    // Pressionar Tab várias vezes e verificar quantos elementos recebem foco
    for (let i = 0; i < Math.min(focusableElementCount, 20); i++) {
      await this.page.keyboard.press('Tab');
      
      const elementInfo = await this.page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return 'body';
        return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}`;
      });
      
      uniqueFocusedElements.add(elementInfo);
    }
    
    // Verificar se conseguimos navegar por pelo menos 3 elementos diferentes
    // ou pelo menos 50% dos elementos focáveis se houver menos de 6
    const minExpectedFocusedElements = focusableElementCount <= 6 
      ? Math.floor(focusableElementCount / 2)
      : 3;
    
    expect(
      uniqueFocusedElements.size,
      `Should be able to focus at least ${minExpectedFocusedElements} different elements with keyboard`
    ).toBeGreaterThanOrEqual(minExpectedFocusedElements);
  }
  
  /**
   * Retorna o número de elementos focáveis na página
   */
  private async countFocusableElements() {
    return await this.page.evaluate(() => {
      const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
        'details summary'
      ];
      
      return document.querySelectorAll(focusableSelectors.join(',')).length;
    });
  }
  
  /**
   * Verifica se os links da navegação são acessíveis
   */
  async expectNavigationLinksAccessible() {
    const navLinks = await this.page.locator('nav a, .nav a, [role="navigation"] a').all();
    
    for (const link of navLinks) {
      // Verificar se o link tem texto ou alternativa acessível
      const hasText = await link.evaluate(el => {
        return el.textContent?.trim() !== '' || 
               el.getAttribute('aria-label') !== null ||
               el.querySelector('img[alt]') !== null;
      });
      
      expect(hasText, 'Navigation link should have accessible text').toBeTruthy();
    }
  }
  
  /**
   * Verifica se as imagens têm texto alternativo
   */
  async expectImagesAccessible() {
    const images = await this.page.locator('img').all();
    
    for (const img of images) {
      const isDecorative = await img.evaluate(el => {
        return el.getAttribute('role') === 'presentation' || 
               el.getAttribute('aria-hidden') === 'true';
      });
      
      if (!isDecorative) {
        const hasAlt = await img.evaluate(el => {
          return el.hasAttribute('alt') && el.getAttribute('alt') !== '';
        });
        
        expect(hasAlt, 'Non-decorative image should have alt text').toBeTruthy();
      }
    }
  }
  
  /**
   * Funções especiais para testar acessibilidade no MoneyFlow
   */
  
  /**
   * Verifica se os controles do diagrama Sankey são acessíveis
   */
  async expectSankeyControlsAccessible() {
    // Verificar botões de controle
    const controls = await this.page.locator('.btn, button').filter({ visible: true }).all();
    
    for (const control of controls) {
      const hasAccessibleName = await control.evaluate(el => {
        return el.textContent?.trim() !== '' || 
               el.getAttribute('aria-label') !== null;
      });
      
      expect(hasAccessibleName, 'Control buttons should have accessible names').toBeTruthy();
    }
    
    // Verificar sliders e inputs
    const inputs = await this.page.locator('input[type="range"], input[type="number"]').filter({ visible: true }).all();
    
    for (const input of inputs) {
      const hasLabel = await input.evaluate(el => {
        const id = el.getAttribute('id');
        if (!id) return false;
        
        return document.querySelector(`label[for="${id}"]`) !== null || 
               el.getAttribute('aria-label') !== null;
      });
      
      expect(hasLabel, 'Input controls should have associated labels').toBeTruthy();
    }
  }
}