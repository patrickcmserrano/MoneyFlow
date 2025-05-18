import { test, expect } from '@playwright/test';
import { MoneyFlowPage } from './page-objects/MoneyFlowPage';
import { AccessibilityHelper } from './helpers/accessibility';
import { setupCustomMatchers } from './helpers/custom-matchers';

// Configurar matchers personalizados
setupCustomMatchers();

test.describe('Análise detalhada do MoneyFlow', () => {
  test('deve exibir e atualizar corretamente o diagrama Sankey com diferentes anos', async ({ page }) => {
    const moneyFlowPage = new MoneyFlowPage(page);
    await moneyFlowPage.gotoMoneyFlow();
    
    // Verificar o ano inicial (deve ser 2025 por padrão)
    let yearLabelText = await moneyFlowPage.yearLabel.textContent();
    expect(yearLabelText).toBe('2025');
    
    // Mudar para cada ano disponível e verificar o diagrama
    const yearsToTest = ['2020', '2021', '2022', '2023', '2024', '2025'];
    
    for (const year of yearsToTest) {
      await moneyFlowPage.changeYear(year);
      yearLabelText = await moneyFlowPage.yearLabel.textContent();
      expect(yearLabelText).toBe(year);
      
      // Verificar se o diagrama foi atualizado (isso é mais difícil de testar visualmente)
      // No mínimo podemos verificar se o diagrama está visível
      await expect(moneyFlowPage.sankeyChart).toBeVisible();
      
      // Aguardar um momento para que o diagrama termine de renderizar antes de mudar para o próximo ano
      await page.waitForTimeout(300);
    }
  });

  test('deve aplicar corretamente os filtros de tipo de dinheiro', async ({ page }) => {
    const moneyFlowPage = new MoneyFlowPage(page);
    await moneyFlowPage.gotoMoneyFlow();
    
    // Verificar filtro de dinheiro físico
    await moneyFlowPage.applyFilter('physical');
    
    // Verificar se o diagrama foi atualizado (verificação visual limitada)
    await expect(moneyFlowPage.sankeyChart).toBeVisible();
    await page.waitForTimeout(500);
    
    // Verificar filtro de dinheiro eletrônico
    await moneyFlowPage.applyFilter('electronic');
    await expect(moneyFlowPage.sankeyChart).toBeVisible();
    await page.waitForTimeout(500);
    
    // Voltar para todos os fluxos
    await moneyFlowPage.applyFilter('all');
    await expect(moneyFlowPage.sankeyChart).toBeVisible();
  });

  test('deve executar a animação corretamente', async ({ page }) => {
    const moneyFlowPage = new MoneyFlowPage(page);
    await moneyFlowPage.gotoMoneyFlow();
    
    // Iniciar a animação
    await moneyFlowPage.startAnimation();
    
    // Verificar se a barra de progresso está visível
    await expect(moneyFlowPage.progressBar).toBeVisible();
    
    // Deixar a animação rodar um pouco e verificar o progresso
    await page.waitForTimeout(1000);
    
    // O progresso deve ter aumentado (é difícil verificar o valor exato)
    const progressWidth = await moneyFlowPage.progressBar.evaluate(el => el.style.width);
    
    // Verificar se o progresso não é zero ou vazio
    expect(progressWidth).not.toBe('');
    expect(progressWidth).not.toBe('0%');
    
    // Parar a animação
    await moneyFlowPage.stopAnimation();
  });

  test('deve funcionar corretamente no modo passo a passo', async ({ page }) => {
    const moneyFlowPage = new MoneyFlowPage(page);
    await moneyFlowPage.gotoMoneyFlow();
    
    // Ativar o modo passo a passo
    await moneyFlowPage.enableStepMode();
    
    // Verificar se a indicação de passo a passo está visível
    const stepIndicator = page.locator('.step-indicator');
    await expect(stepIndicator).toBeVisible();
    
    // Capturar o valor do passo atual
    const initialStepText = await stepIndicator.textContent();
    
    // Clicar em próximo passo
    await moneyFlowPage.nextStep();
    
    // Aguardar a atualização
    await page.waitForTimeout(800);
    
    // Capturar o novo valor do passo
    const updatedStepText = await stepIndicator.textContent();
    
    // O texto deve ser diferente após avançar
    expect(updatedStepText).not.toBe(initialStepText);
  });

  test('deve exibir a seção de fontes de dados', async ({ page }) => {
    const moneyFlowPage = new MoneyFlowPage(page);
    await moneyFlowPage.gotoMoneyFlow();
    
    // Verificar a seção de fontes de dados
    await moneyFlowPage.verifyDataSourcesVisible();
  });

  test('deve ser utilizável em diferentes tamanhos de tela', async ({ page }) => {
    const moneyFlowPage = new MoneyFlowPage(page);
    
    // Testar em desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await moneyFlowPage.gotoMoneyFlow();
    await expect(moneyFlowPage.sankeyChart).toBeVisible();
    
    // Testar em tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await moneyFlowPage.gotoMoneyFlow();
    await expect(moneyFlowPage.sankeyChart).toBeVisible();
    
    // Testar em celular
    await page.setViewportSize({ width: 414, height: 896 });
    await moneyFlowPage.gotoMoneyFlow();
    await expect(moneyFlowPage.sankeyChart).toBeVisible();
  });
});
