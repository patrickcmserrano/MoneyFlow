import { test, expect } from '@playwright/test';
import { HomePage } from './page-objects/HomePage';
import { AccessibilityHelper } from './helpers/accessibility';

test.describe('Funcionalidades básicas do MoneyFlow', () => {
  test('deve carregar a página inicial corretamente', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Verificar se o título está correto
    const pageTitle = await page.title();
    expect(pageTitle).toContain('MoneyMind');
    
    // Verificar se o seletor de idioma está disponível
    await expect(homePage.languageSelector.portuguese).toBeVisible();
  });

  test('deve mudar o idioma corretamente', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Mudar para português
    await homePage.changeLanguage('pt');
    await homePage.expectTextsInLanguage('pt');
    
    // Mudar para inglês
    await homePage.changeLanguage('en');
    await homePage.expectTextsInLanguage('en');
    
    // Mudar para espanhol
    await homePage.changeLanguage('es');
    await homePage.expectTextsInLanguage('es');
  });

  test('deve manter a preferência de idioma após recarregar a página', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Mudar para espanhol
    await homePage.changeLanguage('es');
    
    // Recarregar a página
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verificar se o idioma espanhol foi mantido
    await homePage.expectTextsInLanguage('es');
  });
});
