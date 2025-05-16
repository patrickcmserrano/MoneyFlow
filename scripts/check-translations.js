/**
 * Ferramenta para verificar a consistência entre as traduções
 * 
 * Este script verifica se todas as chaves estão presentes em todos os idiomas
 * e gera um relatório de inconsistências.
 */

import fs from 'fs';
import path from 'path';

// Diretório base de traduções
const localesDir = path.join(process.cwd(), 'src', 'lib', 'locales');

// Idiomas suportados
const languages = ['en', 'es', 'pt'];

// Cores para o console
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

// Carrega as traduções para um idioma
async function loadTranslations(language) {
  const filePath = path.join(localesDir, `${language}.ts`);
  
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Cria um arquivo temporário para importação
      const tempFilePath = path.join(localesDir, `temp_${language}.js`);
      const tempContent = content
        .replace(/export default\s*{/, 'const translations = {')
        .replace(/};(\s*)$/, '};\nexport default translations;');
      
      fs.writeFileSync(tempFilePath, tempContent);
      
      // Importa o arquivo temporário
      const { default: translations } = await import(`file://${tempFilePath}`);
      
      // Remove o arquivo temporário
      fs.unlinkSync(tempFilePath);
      
      return translations;
    }
  } catch (error) {
    console.error(`${colors.red}Erro ao carregar traduções para ${language}:${colors.reset}`, error);
  }
  
  return {};
}

// Coleta todas as chaves únicas de todos os idiomas
function collectAllKeys(translations) {
  const allKeys = new Set();
  
  for (const language in translations) {
    Object.keys(translations[language]).forEach(key => allKeys.add(key));
  }
  
  return Array.from(allKeys).sort();
}

// Verifica as inconsistências entre idiomas
function checkInconsistencies(translations, allKeys) {
  const results = {
    missingKeys: {},
    extraKeys: {},
    total: allKeys.length,
    missingCount: {},
    summary: {},
  };
  
  // Inicializa os contadores
  for (const language of languages) {
    results.missingKeys[language] = [];
    results.extraKeys[language] = [];
    results.missingCount[language] = 0;
  }
  
  // Verifica chaves faltantes
  for (const key of allKeys) {
    for (const language of languages) {
      if (!translations[language][key]) {
        results.missingKeys[language].push(key);
        results.missingCount[language]++;
      }
    }
  }
  
  // Calcula a porcentagem de cobertura
  for (const language of languages) {
    const coverage = ((allKeys.length - results.missingCount[language]) / allKeys.length) * 100;
    results.summary[language] = {
      total: allKeys.length,
      missing: results.missingCount[language],
      coverage: coverage.toFixed(2) + '%',
    };
  }
  
  return results;
}

// Agrupa as chaves faltantes por seção
function groupMissingKeysBySection(missingKeys) {
  const grouped = {};
  
  for (const language in missingKeys) {
    grouped[language] = {};
    
    for (const key of missingKeys[language]) {
      const section = key.split('.')[0];
      
      if (!grouped[language][section]) {
        grouped[language][section] = [];
      }
      
      grouped[language][section].push(key);
    }
  }
  
  return grouped;
}

// Exibe o relatório de inconsistências
function displayReport(results) {
  console.log('\n' + colors.bold + '📊 Relatório de Consistência de Traduções' + colors.reset);
  console.log('========================================\n');
  
  // Resumo
  console.log(colors.bold + '📋 Resumo:' + colors.reset);
  console.log('----------------------------------------');
  for (const language in results.summary) {
    const summary = results.summary[language];
    const coverageColor = parseFloat(summary.coverage) < 90 ? colors.yellow : colors.green;
    
    console.log(`${language.toUpperCase()}: ${coverageColor}${summary.coverage}${colors.reset} de cobertura (${summary.total - summary.missing}/${summary.total} chaves)`);
  }
  
  // Chaves faltantes por seção
  const groupedMissing = groupMissingKeysBySection(results.missingKeys);
  
  for (const language in groupedMissing) {
    if (Object.keys(groupedMissing[language]).length > 0) {
      console.log('\n' + colors.bold + `🔍 Chaves faltantes em ${language.toUpperCase()}:` + colors.reset);
      console.log('----------------------------------------');
      
      for (const section in groupedMissing[language]) {
        console.log(`${colors.blue}${section}${colors.reset} (${groupedMissing[language][section].length} chaves):`);
        
        for (const key of groupedMissing[language][section]) {
          console.log(`  - ${key}`);
        }
        
        console.log('');
      }
    }
  }
  
  // Recomendações
  console.log(colors.bold + '💡 Recomendações:' + colors.reset);
  console.log('----------------------------------------');
  
  if (Object.values(results.missingCount).some(count => count > 0)) {
    console.log('1. Adicione as chaves faltantes aos arquivos de tradução correspondentes');
    console.log('2. Verifique se todas as seções estão corretamente importadas nos arquivos principais');
    console.log('3. Execute novamente este script para verificar as correções');
  } else {
    console.log(`${colors.green}✅ Todas as traduções estão consistentes em todos os idiomas!${colors.reset}`);
  }
}

// Função principal
async function checkTranslationConsistency() {
  console.log(colors.bold + '🔍 Verificando consistência das traduções...' + colors.reset);
  
  // Carrega as traduções para todos os idiomas
  const translations = {};
  for (const language of languages) {
    translations[language] = await loadTranslations(language);
    console.log(`Carregado ${Object.keys(translations[language]).length} chaves para ${language.toUpperCase()}`);
  }
  
  // Coleta todas as chaves únicas
  const allKeys = collectAllKeys(translations);
  console.log(`Total de chaves únicas: ${allKeys.length}`);
  
  // Verifica inconsistências
  const results = checkInconsistencies(translations, allKeys);
  
  // Exibe o relatório
  displayReport(results);
  
  // Retorna status de sucesso
  return Object.values(results.missingCount).every(count => count === 0);
}

// Executa a verificação
checkTranslationConsistency()
  .then(success => {
    if (!success) {
      console.log('\n⚠️  Há inconsistências nas traduções que precisam ser corrigidas.');
      // Em um ambiente de CI, poderíamos usar: process.exit(1);
    }
  })
  .catch(error => {
    console.error('Erro ao verificar consistência:', error);
    // Em um ambiente de CI: process.exit(1);
  });
