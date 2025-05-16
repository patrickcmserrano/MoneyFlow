// Simplified internationalization (i18n) system
import { addMessages, init, locale, _ } from 'svelte-i18n';
import { writable } from 'svelte/store';

// Language definitions
export const SUPPORTED_LANGUAGES = ['en', 'pt', 'es'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// Basic translations (used mainly for testing)
export const translations = {
  en: {
    greeting: 'Hello',
    welcome: 'Welcome to the application',
    language: 'Language',
    'app.title': 'Svelte Template with Theme',
    'app.subtitle': 'A basic Svelte application template with light/dark theme support.',
    'features.title': 'Included Features',
    'features.theme': 'Light/dark theme toggle',
    'features.accessibility': 'Basic accessibility',
    'features.typescript': 'TypeScript support',
    'features.testing': 'Unit and e2e tests',
    'features.i18n': 'Internationalization support',
    'footer.copyright': '© 2025 Svelte Template. Built with Svelte.',
    'moneyflow.title': 'Money Flow in Brazil',
    'moneyflow.year': 'Year',
    'moneyflow.filter.all': 'All Flows',
    'moneyflow.filter.physical': 'Physical Money',
    'moneyflow.filter.electronic': 'Electronic Money',
    'moneyflow.legend.financial': 'Financial Institutions',
    'moneyflow.legend.people': 'People/Companies',
    'moneyflow.legend.government': 'Government/Treasury',
    'moneyflow.legend.external': 'External Market',
    'moneyflow.legend.electronic': 'Electronic Money'
  },
  pt: {
    greeting: 'Olá',
    welcome: 'Bem-vindo ao aplicativo',
    language: 'Idioma',
    'app.title': 'Template Svelte com Tema',
    'app.subtitle': 'Um modelo básico de aplicação Svelte com suporte a tema claro/escuro.',
    'features.title': 'Recursos Incluídos',
    'features.theme': 'Alternância de tema claro/escuro',
    'features.accessibility': 'Acessibilidade básica',
    'features.typescript': 'Suporte ao TypeScript',
    'features.testing': 'Testes unitários e e2e',
    'features.i18n': 'Suporte à internacionalização',
    'footer.copyright': '© 2025 Template Svelte. Construído com Svelte.',
    'moneyflow.title': 'Fluxo do Dinheiro no Brasil',
    'moneyflow.year': 'Ano',
    'moneyflow.filter.all': 'Todos os Fluxos',
    'moneyflow.filter.physical': 'Dinheiro Físico',
    'moneyflow.filter.electronic': 'Dinheiro Eletrônico',
    'moneyflow.legend.financial': 'Instituições Financeiras',
    'moneyflow.legend.people': 'Pessoas/Empresas',
    'moneyflow.legend.government': 'Governo/Tesouro',
    'moneyflow.legend.external': 'Mercado Externo',
    'moneyflow.legend.electronic': 'Dinheiro Eletrônico'
  },
  es: {
    greeting: 'Hola',
    welcome: 'Bienvenido a la aplicación',
    language: 'Idioma',
    'app.title': 'Plantilla Svelte con Tema',
    'app.subtitle': 'Un modelo básico de aplicación Svelte con soporte para tema claro/oscuro.',
    'features.title': 'Características Incluidas',
    'features.theme': 'Alternancia de tema claro/oscuro',
    'features.accessibility': 'Accesibilidad básica',
    'features.typescript': 'Soporte para TypeScript',
    'features.testing': 'Pruebas unitarias y e2e',
    'features.i18n': 'Soporte para internacionalización',
    'footer.copyright': '© 2025 Plantilla Svelte. Construido con Svelte.',
    'moneyflow.title': 'Flujo de Dinero en Brasil',
    'moneyflow.year': 'Año',
    'moneyflow.filter.all': 'Todos los Flujos',
    'moneyflow.filter.physical': 'Dinero Físico',
    'moneyflow.filter.electronic': 'Dinero Electrónico',
    'moneyflow.legend.financial': 'Instituciones Financieras',
    'moneyflow.legend.people': 'Personas/Empresas',
    'moneyflow.legend.government': 'Gobierno/Tesoro',
    'moneyflow.legend.external': 'Mercado Externo',
    'moneyflow.legend.electronic': 'Dinero Electrónico'
  }
};

// Add messages to the dictionary
addMessages('en', translations.en);
addMessages('pt', translations.pt);
addMessages('es', translations.es);

// Initialize i18n with appropriate settings
export function setupI18n() {
  const initialLocale = getInitialLocale();
  
  init({
    fallbackLocale: 'en',
    initialLocale: initialLocale,
  });
}

type TranslationKey = keyof typeof translations['en'];

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
    t(key: TranslationKey, lang: SupportedLanguage = 'en') {
      return translations[lang]?.[key] || key;
    },
    translations // Export translations for tests
  };

  return store;
}

export const i18n = createI18nStore();

// Configure on load
setupI18n();

export { _, locale };