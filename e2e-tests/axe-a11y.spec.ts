import { test, expect } from '@playwright/test';
import { HomePage } from './page-objects/HomePage';
import { MoneyFlowPage } from './page-objects/MoneyFlowPage';
import { MoneyMindPage } from './page-objects/MoneyMindPage';
import AxeBuilder from '@axe-core/playwright';

/**
 * Testes avançados de acessibilidade usando a biblioteca axe-core
 * É necessário instalar o pacote @axe-core/playwright:
 * npm install --save-dev @axe-core/playwright
 */
test.describe('Acessibilidade com axe-core', () => {
  test('página inicial deve passar nas verificações de acessibilidade', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Executar análise de acessibilidade com axe
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    // Logar para diagnóstico, se necessário
    console.log(`Encontradas ${accessibilityScanResults.violations.length} violações de acessibilidade`);
    
    // Expectativa: nenhuma violação crítica
    const criticalViolations = accessibilityScanResults.violations.filter(v => v.impact === 'critical');
    expect(criticalViolations.length, 'Não deve haver violações críticas de acessibilidade').toBe(0);
    
    // Se houver violações não críticas, listar para conhecimento
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Violações de acessibilidade não críticas encontradas:');
      accessibilityScanResults.violations.forEach(violation => {
        console.log(`${violation.impact}: ${violation.help} - ${violation.helpUrl}`);
      });
    }
  });

  test('MoneyFlow deve passar nas verificações de acessibilidade', async ({ page }) => {
    const moneyFlowPage = new MoneyFlowPage(page);
    await moneyFlowPage.gotoMoneyFlow();
    
    // Executar análise de acessibilidade com axe
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      // Excluir o diagrama Sankey (que é gerado por Plotly e difícil de tornar 100% acessível)
      .exclude('.js-plotly-plot')
      .analyze();
    
    // Logar para diagnóstico, se necessário
    console.log(`Encontradas ${accessibilityScanResults.violations.length} violações de acessibilidade`);
    
    // Expectativa: nenhuma violação crítica
    const criticalViolations = accessibilityScanResults.violations.filter(v => v.impact === 'critical');
    expect(criticalViolations.length, 'Não deve haver violações críticas de acessibilidade').toBe(0);
    
    // Se houver violações não críticas, listar para conhecimento
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Violações de acessibilidade não críticas encontradas:');
      accessibilityScanResults.violations.forEach(violation => {
        console.log(`${violation.impact}: ${violation.help} - ${violation.helpUrl}`);
      });
    }
  });

  test('MoneyMind deve passar nas verificações de acessibilidade', async ({ page }) => {
    const moneyMindPage = new MoneyMindPage(page);
    await moneyMindPage.gotoMoneyMind();
    
    // Fechar a mensagem de crepúsculo se aparecer
    await moneyMindPage.closeTwilightMessageIfVisible();
    
    // Executar análise de acessibilidade com axe
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      // Excluir a cena 3D (que é difícil de tornar totalmente acessível)
      .exclude('.coin-scene-container')
      .analyze();
    
    // Logar para diagnóstico, se necessário
    console.log(`Encontradas ${accessibilityScanResults.violations.length} violações de acessibilidade`);
    
    // Expectativa: nenhuma violação crítica
    const criticalViolations = accessibilityScanResults.violations.filter(v => v.impact === 'critical');
    expect(criticalViolations.length, 'Não deve haver violações críticas de acessibilidade').toBe(0);
    
    // Se houver violações não críticas, listar para conhecimento
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Violações de acessibilidade não críticas encontradas:');
      accessibilityScanResults.violations.forEach(violation => {
        console.log(`${violation.impact}: ${violation.help} - ${violation.helpUrl}`);
      });
    }
  });
});
