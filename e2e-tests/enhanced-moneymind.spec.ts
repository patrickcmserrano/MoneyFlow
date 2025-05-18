import { test, expect } from '@playwright/test';
import { MoneyMindPage } from './page-objects/MoneyMindPage';
import { AccessibilityHelper } from './helpers/accessibility';
import { setupCustomMatchers } from './helpers/custom-matchers';

// Configurar matchers personalizados
setupCustomMatchers();

test.describe('Análise detalhada do MoneyMind', () => {
  test('deve carregar a cena 3D corretamente', async ({ page }) => {
    const moneyMindPage = new MoneyMindPage(page);
    await moneyMindPage.gotoMoneyMind();
    
    // Verificar se a mensagem de crepúsculo aparece e fechar se necessário
    await moneyMindPage.closeTwilightMessageIfVisible();
    
    // Verificar se a cena 3D está visível
    await moneyMindPage.verifyCoinSceneVisible();
  });

  test('deve navegar corretamente entre todas as seções', async ({ page }) => {
    const moneyMindPage = new MoneyMindPage(page);
    await moneyMindPage.gotoMoneyMind();
    
    // Fechar a mensagem de crepúsculo se aparecer
    await moneyMindPage.closeTwilightMessageIfVisible();
    
    // Lista de seções para testar
    const sections = ['intro', 'primitiveorigins', 'coinsmetal', 'paperdigital', 'philosophy'];
    
    // Navegar para cada seção e verificar
    for (const section of sections) {
      await moneyMindPage.navigateToSection(section);
      
      // Verificar se a seção está visível
      await moneyMindPage.expectSectionVisible(section);
      
      // Aguardar um pouco para visualizar a seção antes de passar para a próxima
      await page.waitForTimeout(300);
    }
  });

  test('roadmap de navegação deve ser acessível por teclado', async ({ page }) => {
    const moneyMindPage = new MoneyMindPage(page);
    await moneyMindPage.gotoMoneyMind();
    
    // Fechar a mensagem de crepúsculo se aparecer
    await moneyMindPage.closeTwilightMessageIfVisible();
    
    // Verificar se o roadmap está visível
    await expect(moneyMindPage.roadmapNav).toBeVisible();
    
    // Verificar navegação por teclado
    await moneyMindPage.verifyRoadmapKeyboardNavigation();
  });

  test('deve mudar idioma e manter contexto na seção atual', async ({ page }) => {
    const moneyMindPage = new MoneyMindPage(page);
    await moneyMindPage.gotoMoneyMind();
    
    // Fechar a mensagem de crepúsculo se aparecer
    await moneyMindPage.closeTwilightMessageIfVisible();
    
    // Navegar para a seção de filosofia
    await moneyMindPage.navigateToSection('philosophy');
    
    // Mudar o idioma para inglês
    await moneyMindPage.changeLanguage('en');
    
    // Verificar se continuamos na mesma seção
    await moneyMindPage.expectSectionVisible('philosophy');
    
    // Mudar para espanhol
    await moneyMindPage.changeLanguage('es');
    
    // Verificar se continuamos na mesma seção
    await moneyMindPage.expectSectionVisible('philosophy');
  });

  test('deve ser utilizável em diferentes tamanhos de tela', async ({ page }) => {
    const moneyMindPage = new MoneyMindPage(page);
    
    // Testar em desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await moneyMindPage.gotoMoneyMind();
    await moneyMindPage.closeTwilightMessageIfVisible();
    await expect(moneyMindPage.roadmapNav).toBeVisible();
    
    // Navegar para alguma seção para verificar responsividade
    await moneyMindPage.navigateToSection('coinsmetal');
    await moneyMindPage.expectSectionVisible('coinsmetal');
    
    // Testar em tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await moneyMindPage.gotoMoneyMind();
    await moneyMindPage.closeTwilightMessageIfVisible();
    await expect(moneyMindPage.roadmapNav).toBeVisible();
    
    // Navegar para alguma seção para verificar responsividade
    await moneyMindPage.navigateToSection('coinsmetal');
    await moneyMindPage.expectSectionVisible('coinsmetal');
    
    // Testar em celular
    await page.setViewportSize({ width: 414, height: 896 });
    await moneyMindPage.gotoMoneyMind();
    await moneyMindPage.closeTwilightMessageIfVisible();
    
    // Em celular, o roadmap deve estar visível ou haver algum botão de menu
    // Dependendo da implementação da responsividade
    // Verificar conteúdo principal
    await expect(moneyMindPage.introSection).toBeVisible();
  });

  test('deve manter o estado 3D ao navegar entre seções', async ({ page }) => {
    const moneyMindPage = new MoneyMindPage(page);
    await moneyMindPage.gotoMoneyMind();
    
    // Fechar a mensagem de crepúsculo se aparecer
    await moneyMindPage.closeTwilightMessageIfVisible();
    
    // Verificar se a cena 3D está visível inicialmente
    await moneyMindPage.verifyCoinSceneVisible();
    
    // Navegar para diferentes seções
    await moneyMindPage.navigateToSection('coinsmetal');
    await moneyMindPage.expectSectionVisible('coinsmetal');
    
    // Verificar se a cena 3D ainda está visível após a navegação
    await moneyMindPage.verifyCoinSceneVisible();
    
    // Navegar para outra seção
    await moneyMindPage.navigateToSection('philosophy');
    await moneyMindPage.expectSectionVisible('philosophy');
    
    // Verificar se a cena 3D ainda está visível
    await moneyMindPage.verifyCoinSceneVisible();
  });
});
