import { chromium } from '@playwright/test';
import { setupCustomMatchers } from './helpers/custom-matchers';

// Configurar matchers personalizados globalmente
setupCustomMatchers();

// Função de setup global exigida pelo Playwright
export default async function globalSetup() {
  // Qualquer configuração que precise ser executada uma vez antes de todos os testes
  console.log('Executando setup global para testes E2E...');
  
  // Verificar se o servidor está acessível antes de iniciar os testes
  try {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Tentar acessar a página com um timeout mais longo
    console.log('Verificando se o servidor está acessível...');
    await page.goto('http://localhost:5174/MoneyFlow/', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    await page.waitForSelector('body', { timeout: 10000 });
    console.log('Servidor disponível e respondendo corretamente');
    
    await browser.close();
  } catch (error) {
    console.log('Aviso: Não foi possível verificar o servidor. Os testes podem falhar se ele não estiver disponível.');
    console.log(`Erro detalhado: ${error.message}`);
  }
}
