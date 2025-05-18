import { expect } from '@playwright/test';
import { setupCustomMatchers } from './helpers/custom-matchers';

// Configurar matchers personalizados globalmente
setupCustomMatchers();

// Qualquer outra configuração global pode ser adicionada aqui

// Função de setup global exigida pelo Playwright
export default async function globalSetup() {
  // Qualquer configuração que precise ser executada uma vez antes de todos os testes
  console.log('Executando setup global para testes E2E...');
}
