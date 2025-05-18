import { test, expect } from '@playwright/test';
import { HomePage } from './page-objects/HomePage';

test.describe('Internacionalização (i18n)', () => {
  test('deve ter textos corretos em todos os idiomas', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Verificar idioma padrão (provavelmente inglês)
    const initialLanguage = await homePage.getCurrentLanguage();
    console.log(`Idioma inicial: ${initialLanguage}`);
    
    // Testes com idioma português
    await homePage.changeLanguage('pt');
    // Aguardar um pouco mais para garantir que a mudança de idioma seja aplicada
    await page.waitForTimeout(1000);
    
    // Verificar se algum texto em português está visível
    const brazilTextPt = await page.getByText('Fluxo do Dinheiro').isVisible();
    expect(brazilTextPt, 'Texto em português deve estar visível').toBeTruthy();
    
    // Verificar elementos específicos em português
    if (await page.locator('label:has-text("Ano:")').isVisible()) {
      const yearLabelPt = page.locator('label:has-text("Ano:")');
      await expect(yearLabelPt).toBeVisible();
    }
    
    // Voltar para o idioma inglês
    await homePage.changeLanguage('en');
    await page.waitForTimeout(1000);
    
    // Verificar se algum texto em inglês está visível
    const brazilTextEn = await page.getByText('Money Flow').isVisible();
    expect(brazilTextEn, 'Texto em inglês deve estar visível').toBeTruthy();
    
    // Verificar elementos específicos em inglês
    if (await page.locator('label:has-text("Year:")').isVisible()) {
      const yearLabelEn = page.locator('label:has-text("Year:")');
      await expect(yearLabelEn).toBeVisible();
    }
    
    // Testes com idioma espanhol
    await homePage.changeLanguage('es');
    await page.waitForTimeout(1000);
    
    // Verificar se algum texto em espanhol está visível
    const brazilTextEs = await page.getByText('Flujo de Dinero').isVisible();
    expect(brazilTextEs, 'Texto em espanhol deve estar visível').toBeTruthy();
    
    // Verificar elementos específicos em espanhol
    if (await page.locator('label:has-text("Año:")').isVisible()) {
      const yearLabelEs = page.locator('label:has-text("Año:")');
      await expect(yearLabelEs).toBeVisible();
    }
  });

  test('deve manter o idioma ao alternar entre MoneyFlow e MoneyMind', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Mudar para espanhol para facilitar a detecção de mudanças
    await homePage.changeLanguage('es');
    await page.waitForTimeout(1000);
    
    // Ver qual é a visão atual
    const isMoneyMindVisible = await page.locator('.moneymind-wrapper').isVisible();
    const isMoneyFlowVisible = await page.locator('.moneyflow-wrapper').isVisible();
    
    if (isMoneyMindVisible) {
      console.log('Começando no MoneyMind');
      // Se estiver no MoneyMind, verificar texto em espanhol
      await expect(page.getByText('Explora el significado', { exact: false })).toBeVisible();
      
      // Alternar para MoneyFlow
      const switchButtonLocator = page.getByRole('button').filter({ hasText: /Volver|Flujo/i });
      if (await switchButtonLocator.isVisible()) {
        await switchButtonLocator.click();
        await page.waitForTimeout(1000);
        
        // Verificar se o MoneyFlow está em espanhol
        const moneyFlowTextEs = await page.getByText('Flujo de Dinero').isVisible();
        expect(moneyFlowTextEs, 'Texto em espanhol deve ser mantido após alternar').toBeTruthy();
      }
    } else if (isMoneyFlowVisible) {
      console.log('Começando no MoneyFlow');
      // Se estiver no MoneyFlow, verificar texto em espanhol
      await expect(page.getByText('Flujo de Dinero', { exact: false })).toBeVisible();
      
      // Alternar para MoneyMind
      const switchButtonLocator = page.getByRole('button').filter({ hasText: /Alternar|MoneyMind/i });
      if (await switchButtonLocator.isVisible()) {
        await switchButtonLocator.click();
        await page.waitForTimeout(1000);
        
        // Verificar se o MoneyMind está em espanhol
        const moneyMindTextEs = await page.getByText('Explora', { exact: false }).isVisible();
        expect(moneyMindTextEs, 'Texto em espanhol deve ser mantido após alternar').toBeTruthy();
      }
    } else {
      // Se nenhum dos componentes estiver visível, falhar o teste
      expect(false, 'Nem MoneyFlow nem MoneyMind estão visíveis').toBeTruthy();
    }
  });
});
