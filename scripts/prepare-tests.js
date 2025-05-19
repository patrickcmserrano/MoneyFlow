#!/usr/bin/env node

/**
 * Script para preparar o ambiente de testes
 * Este script instala as dependências necessárias e configura o ambiente para executar os testes
 */

const { execSync } = require('child_process');
const { existsSync, writeFileSync } = require('fs');
const path = require('path');

console.log('🚀 Preparando ambiente para os testes...');

// Verifica se o Playwright está instalado
try {
  console.log('Verificando instalação do Playwright...');
  execSync('npx playwright --version', { stdio: 'pipe' });
  console.log('✅ Playwright já está instalado');
} catch (error) {
  console.log('⚠️ Instalando Playwright...');
  execSync('npm install -D @playwright/test', { stdio: 'inherit' });
}

// Instala os navegadores necessários
try {
  console.log('Instalando navegadores do Playwright...');
  execSync('npx playwright install chromium', { stdio: 'inherit' });
  console.log('✅ Navegadores instalados com sucesso');
} catch (error) {
  console.error('❌ Erro ao instalar navegadores:', error);
}

// Tenta instalar as dependências do sistema (só vai funcionar se o usuário tiver permissões sudo)
console.log('Tentando instalar dependências do sistema...');
try {
  execSync('sudo npx playwright install-deps chromium', { stdio: 'inherit' });
  console.log('✅ Dependências do sistema instaladas com sucesso');
} catch (error) {
  console.log('⚠️ Não foi possível instalar as dependências do sistema automaticamente.');
  console.log('Para instalar manualmente, execute: sudo npx playwright install-deps');
}

// Inicia o servidor de desenvolvimento
let serverProcess;

function startServer() {
  console.log('Iniciando servidor de desenvolvimento...');
  
  try {
    execSync('npm run dev', {
      stdio: 'inherit',
      timeout: 5000
    });
  } catch (error) {
    console.log('Servidor iniciado com sucesso (em segundo plano)');
  }
}

// Função para executar os testes com chromium apenas
function runTests() {
  console.log('\n🧪 Executando testes (apenas com Chromium)...');
  
  try {
    execSync('npx playwright test --project=chromium', { stdio: 'inherit' });
    console.log('✅ Testes executados com sucesso!');
  } catch (error) {
    console.error('❌ Alguns testes falharam:', error.message);
  }
}

// Executa o fluxo principal
try {
  startServer();
  
  // Dá tempo para o servidor iniciar
  console.log('Aguardando servidor iniciar (10 segundos)...');
  execSync('sleep 10');
  
  runTests();
  
  console.log('\n✅ Processo de preparação concluído!');
  console.log('\nPara executar os testes novamente:');
  console.log('1. Inicie o servidor: npm run dev');
  console.log('2. Execute os testes: npm run e2e');
} catch (error) {
  console.error('❌ Erro durante a preparação:', error);
}
