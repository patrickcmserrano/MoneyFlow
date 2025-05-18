import { Page, Locator, expect } from '@playwright/test';
import { HomePage } from './HomePage';

/**
 * Page Object específico para o componente MoneyMind
 * Estende a funcionalidade do HomePage
 */
export class MoneyMindPage extends HomePage {
  // Elementos específicos do MoneyMind
  readonly roadmapNav: Locator;
  readonly introSection: Locator;
  readonly primitiveOriginsSection: Locator;
  readonly coinsMetalSection: Locator;
  readonly paperDigitalSection: Locator;
  readonly philosophySection: Locator;
  readonly coinScene: Locator;
  readonly twilightMessage: Locator;
  readonly closeMessageButton: Locator;
  
  // Mapeamento de seções para IDs e localizadores
  readonly sections: { [key: string]: { id: string, locator: Locator } };
  
  constructor(page: Page) {
    super(page);
    
    this.roadmapNav = page.locator('.roadmap-nav');
    this.introSection = page.locator('#intro');
    this.primitiveOriginsSection = page.locator('#primitiveorigins');
    this.coinsMetalSection = page.locator('#coinsmetal');
    this.paperDigitalSection = page.locator('#paperdigital');
    this.philosophySection = page.locator('#philosophy');
    this.coinScene = page.locator('.coin-scene-container');
    this.twilightMessage = page.locator('div[role="dialog"]').filter({ hasText: /Modo Crepúsculo|Twilight Mode|Modo Crepúsculo/ });
    this.closeMessageButton = page.getByRole('button').filter({ hasText: /Entendi|I Understand|Entendido/ });
    
    // Configurar o mapeamento de seções
    this.sections = {
      'intro': { id: 'intro', locator: this.introSection },
      'primitiveorigins': { id: 'primitiveorigins', locator: this.primitiveOriginsSection },
      'coinsmetal': { id: 'coinsmetal', locator: this.coinsMetalSection },
      'paperdigital': { id: 'paperdigital', locator: this.paperDigitalSection },
      'philosophy': { id: 'philosophy', locator: this.philosophySection }
    };
  }
  
  /**
   * Navega especificamente para a visualização MoneyMind
   */
  async gotoMoneyMind() {
    await this.goto();
    await this.navigateToMoneyMind();
    await this.page.waitForSelector('.moneymind-wrapper');
  }
  
  /**
   * Navega para uma seção específica do MoneyMind
   * @param sectionId ID da seção para navegar ('intro', 'primitiveorigins', etc.)
   */
  async navigateToSection(sectionId: string) {
    if (!this.sections[sectionId]) {
      throw new Error(`Seção ${sectionId} não encontrada`);
    }
    
    // Clicar no item do roadmap correspondente à seção
    const navLink = this.page.locator(`[data-section="${sectionId}"]`);
    await navLink.click();
    
    // Aguardar por algum tempo para a animação de rolagem
    await this.page.waitForTimeout(800);
    
    // Verificar se a seção está visível
    await expect(this.sections[sectionId].locator).toBeInViewport();
  }
  
  /**
   * Verifica se uma seção está visível na viewport
   * @param sectionId ID da seção a verificar
   */
  async expectSectionVisible(sectionId: string) {
    if (!this.sections[sectionId]) {
      throw new Error(`Seção ${sectionId} não encontrada`);
    }
    
    await expect(this.sections[sectionId].locator).toBeInViewport();
  }
  
  /**
   * Verifica se a cena 3D de moedas está visível e carregou corretamente
   */
  async verifyCoinSceneVisible() {
    await expect(this.coinScene).toBeAttached();
    
    // Verificar se a cena foi inicializada - isso pode ser mais difícil de testar
    // pois a cena 3D é renderizada em um canvas
    const hasCanvas = await this.page.evaluate(() => {
      return document.querySelector('canvas') !== null;
    });
    
    expect(hasCanvas).toBeTruthy();
  }
  
  /**
   * Fecha a mensagem de crepúsculo se estiver visível
   */
  async closeTwilightMessageIfVisible() {
    if (await this.twilightMessage.isVisible()) {
      await this.closeMessageButton.click();
      await expect(this.twilightMessage).not.toBeVisible();
    }
  }
  
  /**
   * Verifica se a navegação por teclado no roadmap funciona
   */
  async verifyRoadmapKeyboardNavigation() {
    // Focar o roadmap primeiro
    await this.roadmapNav.focus();
    
    // Tentar navegar usando as teclas de seta
    await this.page.keyboard.press('Tab');
    
    // Verificar se conseguimos focar algum item do roadmap
    const isFocused = await this.page.evaluate(() => {
      const focusedElement = document.activeElement;
      return focusedElement && 
             focusedElement.closest('.roadmap-nav') !== null;
    });
    
    expect(isFocused).toBeTruthy();
  }
}
