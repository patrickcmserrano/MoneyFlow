/**
 * Script para migrar as traduções do formato antigo para o novo
 * 
 * Este script lê os arquivos de tradução existentes e os divide
 * em arquivos separados por seção para cada idioma.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obter o diretório do script atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Definir caminhos absolutos para os diretórios
const PROJECT_ROOT = path.resolve(__dirname, '..');
const LOCALES_DIR = path.join(PROJECT_ROOT, 'src', 'lib', 'locales');
const SECTIONS_DIR = path.join(LOCALES_DIR, 'sections');

// Idiomas suportados
const LANGUAGES = ['en', 'es', 'pt'];

// Seções para organizar as traduções
const SECTIONS = {
  app: ['app.', 'features.', 'footer.copyright'],
  moneyflow: ['moneyflow.', 'trendchart.'],
  moneymind: ['moneymind.'],
  navigation: ['navigation.'],
  debug: ['debug.']
};

// Função para criar diretórios se não existirem
function createDirectoryIfNotExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Diretório criado: ${dirPath}`);
  }
}

// Função para extrair as traduções para cada seção
function extractSectionTranslations(translations, sectionPrefixes) {
  const sectionTranslations = {};
  
  Object.keys(translations).forEach(key => {
    if (sectionPrefixes.some(prefix => key.startsWith(prefix))) {
      sectionTranslations[key] = translations[key];
    }
  });
  
  return sectionTranslations;
}

// Função para analisar o arquivo de tradução e extrair o objeto de traduções
function parseTranslationFile(content) {
  try {
    // Abordagem mais robusta: Extrair pares de chave-valor diretamente com expressões regulares
    const translations = {};
    const keyValuePattern = /"([^"]+)":\s*("(?:\\"|[^"])*"|'(?:\\'|[^'])*'|`(?:\\`|[^`])*`),?/g;
    let match;
    
    while ((match = keyValuePattern.exec(content)) !== null) {
      const key = match[1];
      // Remover as aspas do valor
      let value = match[2];
      if (value.startsWith('"') || value.startsWith("'") || value.startsWith('`')) {
        value = value.slice(1, -1);
      }
      translations[key] = value;
    }
    
    if (Object.keys(translations).length === 0) {
      throw new Error('Nenhuma tradução encontrada no arquivo');
    }
    
    return translations;
  } catch (error) {
    console.warn(`Aviso: Método alternativo de parsing sendo utilizado devido a: ${error.message}`);
    
    // Método alternativo: extrair traduções linha por linha
    try {
      const translations = {};
      const lines = content.split('\n');
      
      for (const line of lines) {
        // Procurar por linhas que tenham o formato "chave": "valor",
        const keyValueMatch = line.match(/"([^"]+)":\s*("(?:\\"|[^"])*"|'(?:\\'|[^'])*'|`(?:\\`|[^`])*`),?/);
        if (keyValueMatch) {
          const key = keyValueMatch[1];
          let value = keyValueMatch[2];
          // Remover as aspas do valor
          if (value.startsWith('"') || value.startsWith("'") || value.startsWith('`')) {
            value = value.slice(1, -1);
          }
          translations[key] = value;
        }
      }
      
      if (Object.keys(translations).length === 0) {
        throw new Error('Nenhuma tradução encontrada no arquivo usando método alternativo');
      }
      
      return translations;
    } catch (altError) {
      console.error('Erro no método alternativo:', altError);
      throw new Error(`Não foi possível analisar o arquivo de tradução: ${altError.message}`);
    }
  }
}

// Função para criar o arquivo de seção
function createSectionFile(lang, section, translations) {
  const sectionDir = path.join(SECTIONS_DIR, section);
  createDirectoryIfNotExists(sectionDir);
  
  const filePath = path.join(sectionDir, `${lang}.ts`);
  
  // Formatar o objeto de traduções para melhor legibilidade
  let content = 'export default {\n';
  Object.entries(translations).forEach(([key, value]) => {
    content += `  "${key}": "${value.replace(/"/g, '\\"')}",\n`;
  });
  content += '};\n';
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Arquivo de seção criado: ${filePath}`);
  
  return Object.keys(translations).length > 0;
}

// Função para criar o arquivo principal
function createMainFile(lang, sections) {
  const imports = sections.map(section => 
    `import ${section} from './sections/${section}/${lang}.ts';`
  ).join('\n');
  
  const mergeObj = `Object.assign({}, ${sections.join(', ')})`;
  
  const content = `${imports}\n\nexport default ${mergeObj};\n`;
  
  const filePath = path.join(LOCALES_DIR, `${lang}.new.ts`);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Arquivo principal criado: ${filePath}`);
}

// Função principal de migração
function migrate(lang) {
  try {
    console.log(`\nProcessando idioma: ${lang}`);
    
    // Lê o arquivo de tradução original
    const filePath = path.join(LOCALES_DIR, `${lang}.ts`);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Analisa o conteúdo para extrair as traduções
    const translations = parseTranslationFile(content);
    console.log(`Encontradas ${Object.keys(translations).length} traduções para ${lang}`);
    
    // Cria os diretórios de seção se não existirem
    createDirectoryIfNotExists(SECTIONS_DIR);
    
    // Extrai e cria os arquivos de seção
    const processedSections = [];
    
    for (const [section, prefixes] of Object.entries(SECTIONS)) {
      const sectionTranslations = extractSectionTranslations(translations, prefixes);
      const keysCount = Object.keys(sectionTranslations).length;
      
      if (keysCount > 0) {
        createSectionFile(lang, section, sectionTranslations);
        processedSections.push(section);
        console.log(`Seção ${section}: ${keysCount} traduções extraídas`);
      } else {
        console.log(`Seção ${section}: nenhuma tradução encontrada`);
      }
    }
    
    // Cria o arquivo principal que importa todas as seções
    if (processedSections.length > 0) {
      createMainFile(lang, processedSections);
    } else {
      console.warn(`Nenhuma seção processada para ${lang}!`);
    }
    
    console.log(`✅ Migração para ${lang} concluída com sucesso!`);
  } catch (error) {
    console.error(`❌ Erro ao processar ${lang}:`, error);
  }
}

// Verifica se existem traduções que não foram categorizadas
function checkUncategorizedTranslations(lang, translations) {
  const allPrefixes = Object.values(SECTIONS).flat();
  const uncategorized = Object.keys(translations).filter(key => 
    !allPrefixes.some(prefix => key.startsWith(prefix))
  );
  
  if (uncategorized.length > 0) {
    console.warn(`\n⚠️ Atenção: ${uncategorized.length} traduções para ${lang} não foram categorizadas:`);
    console.warn(uncategorized.slice(0, 10).join(', ') + (uncategorized.length > 10 ? '...' : ''));
    console.warn('Considere adicionar novos prefixos às seções existentes ou criar novas seções.');
  }
}

// Início do script
console.log('🚀 Iniciando migração das traduções...');

// Cria o diretório de seções se não existir
createDirectoryIfNotExists(SECTIONS_DIR);

// Migra cada idioma
LANGUAGES.forEach(lang => migrate(lang));

console.log('\n🎉 Migração concluída! Verifique os arquivos .new.ts e confirme se tudo está correto antes de substituir os originais.');
