// Simplified internationalization (i18n) system
import { addMessages, init, locale, _ } from 'svelte-i18n';
import { writable } from 'svelte/store';

// Importar arquivos de tradução externos
import en from './locales/en';
import pt from './locales/pt';
import es from './locales/es';
import sectionTranslations from './locales/sections';

// Language definitions
export const SUPPORTED_LANGUAGES = ['en', 'pt', 'es'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// Basic translations (usado principalmente para testes)
export const translations = { 
  en: { ...en, ...sectionTranslations.en }, 
  pt: { ...pt, ...sectionTranslations.pt }, 
  es: { ...es, ...sectionTranslations.es } 
};

// Add messages to the dictionary
addMessages('en', { ...en, ...sectionTranslations.en });
addMessages('pt', { ...pt, ...sectionTranslations.pt });
addMessages('es', { ...es, ...sectionTranslations.es });

// Initialize i18n with appropriate settings
export function setupI18n() {
  const initialLocale = getInitialLocale();
  
  init({
    fallbackLocale: 'en',
    initialLocale: initialLocale,
  });
  
  // Debug: verificar se as mensagens estão sendo carregadas corretamente
  console.log('i18n inicializado com locale:', initialLocale);
  console.log('Mensagens disponíveis:', Object.keys(translations).join(', '));
}

// Tipo mais flexível para permitir chaves dinâmicas, especialmente para testes
type TranslationKey = keyof typeof translations['en'] | string;

// Function to get the initial locale based on browser or localStorage
function getInitialLocale() {
  if (typeof window === 'undefined') {
    return 'en';
  }
  
  // Check if there's a preferred language stored in localStorage
  const savedLocale = localStorage.getItem('preferredLanguage');
  
  if (savedLocale && SUPPORTED_LANGUAGES.includes(savedLocale as SupportedLanguage)) {
    return savedLocale;
  }
  
  // Use browser language if available
  const browserLocale = navigator.language.split('-')[0];
  return SUPPORTED_LANGUAGES.includes(browserLocale as SupportedLanguage) ? browserLocale : 'en';
}

export function createI18nStore() {
  const { subscribe, set } = writable<SupportedLanguage>('en');

  const store = {
    subscribe,
    setLanguage(lang: SupportedLanguage) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('preferredLanguage', lang);
      }
      locale.set(lang);
      set(lang);
      console.log(`Idioma alterado para: ${lang}`); // Log para debugar
      return lang;
    },
    initialize() {
      // Get saved preference, if any
      const savedLang = typeof localStorage !== 'undefined' 
        ? localStorage.getItem('preferredLanguage') as SupportedLanguage 
        : null;
      
      if (savedLang && SUPPORTED_LANGUAGES.includes(savedLang)) {
        this.setLanguage(savedLang);
        return;
      }
      
      // Try to use browser language
      if (typeof navigator !== 'undefined') {
        const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
        if (SUPPORTED_LANGUAGES.includes(browserLang)) {
          this.setLanguage(browserLang);
          return;
        }
      }
      
      // Use English as default
      this.setLanguage('en');
    },
    // Permitir qualquer chave de string para testes, mas avisar quando uma chave inexistente for usada
    t(key: TranslationKey, lang: SupportedLanguage = 'en') {
      // Using type assertion to avoid TypeScript's strict index checks
      // while maintaining runtime safety with the conditional check below
      const langTranslations = translations[lang] as Record<string, string>;
      const translation = langTranslations?.[key as string];
      
      if (!translation && process.env.NODE_ENV === 'development') {
        console.warn(`Warning: Translation key "${String(key)}" not found in language "${lang}"`);
      }
      return translation || key;
    },
    translations, // Export translations for tests

    // Método de diagnóstico para verificar inconsistências de tradução
    checkTranslationConsistency() {
      const enKeys = Object.keys(translations.en);
      const ptKeys = Object.keys(translations.pt);
      const esKeys = Object.keys(translations.es);
      
      const missingInPt = enKeys.filter(key => !ptKeys.includes(key));
      const missingInEs = enKeys.filter(key => !esKeys.includes(key));
      
      console.log("=== Diagnóstico de Traduções ===");
      console.log(`Total de chaves: EN=${enKeys.length}, PT=${ptKeys.length}, ES=${esKeys.length}`);
      
      if (missingInPt.length) {
        console.warn(`Chaves faltando em PT: ${missingInPt.join(', ')}`);
      }      if (missingInEs.length) {
        console.warn(`Chaves faltando em ES: ${missingInEs.join(', ')}`);
      }
      
      return { enKeys, ptKeys, esKeys, missingInPt, missingInEs };
    }
  };

  return store;
}

export const i18n = createI18nStore();

// Configure on load
setupI18n();

export { _, locale };