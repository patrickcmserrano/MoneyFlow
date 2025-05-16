import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as i18nModule from './i18n';

// We need to mock the module before importing
vi.mock('svelte-i18n', () => {
  return {
    addMessages: vi.fn(),
    init: vi.fn(),
    locale: {
      set: vi.fn(),
      subscribe: vi.fn()
    },
    _: vi.fn()
  };
});

// Re-import svelte-i18n module to access mocks
import { init, locale } from 'svelte-i18n';

// Mock das traduções para testes
vi.mock('./locales/en', () => ({
  default: { 
    "app.title": "Svelte Template with Theme",
    "moneyflow.title": "Money Flow in Brazil",
    "greeting": "Hello", 
    "welcome": "Welcome to the application", 
    "language": "Language" 
  }
}));

vi.mock('./locales/pt', () => ({
  default: { 
    "app.title": "Template Svelte com Tema",
    "moneyflow.title": "Fluxo do Dinheiro no Brasil",
    "greeting": "Olá", 
    "welcome": "Bem-vindo ao aplicativo", 
    "language": "Idioma" 
  }
}));

vi.mock('./locales/es', () => ({
  default: { 
    "app.title": "Plantilla Svelte con Tema",
    "moneyflow.title": "Flujo de Dinero en Brasil",
    "greeting": "Hola", 
    "welcome": "Bienvenido a la aplicación", 
    "language": "Idioma" 
  }
}));

describe('i18n Setup', () => {
  let localStorageMock: { [key: string]: string } = {};
  
  beforeEach(() => {
    // Clear mocks
    vi.clearAllMocks();
    
    // Mock for localStorage
    localStorageMock = {};
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(
      (key: string) => localStorageMock[key] || null
    );
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(
      (key: string, value: string) => {
        localStorageMock[key] = value;
      }
    );
    
    // Mock for navigator.language
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with English as default when there is no saved preference or browser preference', () => {
    // Simulate unsupported browser language
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('invalid-lang');
    
    // Spy on the real implementation method
    const i18n = i18nModule.createI18nStore();
    const setLanguageSpy = vi.spyOn(i18n, 'setLanguage');
    
    i18n.initialize();
    
    expect(setLanguageSpy).toHaveBeenCalledWith('en');
  });

  it('should use the saved preference from localStorage if available', () => {
    // Set a saved preference
    localStorageMock['preferredLanguage'] = 'es';
    
    const i18n = i18nModule.createI18nStore();
    const setLanguageSpy = vi.spyOn(i18n, 'setLanguage');
    
    i18n.initialize();
    
    expect(setLanguageSpy).toHaveBeenCalledWith('es');
  });

  it('should use the browser language if there is no saved preference and the language is supported', () => {
    // Set browser language as Portuguese
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('pt');
    
    // Create a new i18n instance to avoid shared state issues
    const i18n = i18nModule.createI18nStore();
    const setLanguageSpy = vi.spyOn(i18n, 'setLanguage');
    
    i18n.initialize();
    
    expect(setLanguageSpy).toHaveBeenCalledWith('pt');
  });

  it('should verify that all language files are correctly registered', () => {
    // Test if main languages have translations
    const i18n = i18nModule.createI18nStore();
    expect(Object.keys(i18n.translations)).toContain('en');
    expect(Object.keys(i18n.translations)).toContain('es');
    expect(Object.keys(i18n.translations)).toContain('pt');
    
    // Test with actual translation keys that exist in all locales
    expect(i18n.t('app.title', 'en')).toBe('Svelte Template with Theme');
    expect(i18n.t('moneyflow.title', 'pt')).toBe('Fluxo do Dinheiro no Brasil');
    expect(i18n.t('app.title', 'es')).toBe('Plantilla Svelte con Tema');
    
    // Test with mocked translation keys for testing purposes
    // @ts-ignore - Ignoring type check for test-only keys
    expect(i18n.t('greeting', 'en')).toBe('Hello');
    // @ts-ignore - Ignoring type check for test-only keys
    expect(i18n.t('welcome', 'es')).toBe('Bienvenido a la aplicación');
    // @ts-ignore - Ignoring type check for test-only keys
    expect(i18n.t('language', 'pt')).toBe('Idioma');
  });

  it('should update localStorage and svelte-i18n locale when setLanguage is called', () => {
    const i18n = i18nModule.createI18nStore();
    
    i18n.setLanguage('pt');
    
    expect(localStorageMock['preferredLanguage']).toBe('pt');
    expect(locale.set).toHaveBeenCalledWith('pt');
  });

  it('should return the key itself when a translation is not found', () => {
    const i18n = i18nModule.createI18nStore();
    const nonExistentKey = 'non.existent.key' as any;
    
    expect(i18n.t(nonExistentKey, 'en')).toBe(nonExistentKey);
    expect(i18n.t(nonExistentKey, 'pt')).toBe(nonExistentKey);
    expect(i18n.t(nonExistentKey, 'es')).toBe(nonExistentKey);
  });

  it('should have consistent translation keys across all languages', () => {
    const i18n = i18nModule.createI18nStore();
    
    // Usar o método checkTranslationConsistency para verificar
    const result = i18n.checkTranslationConsistency();
    
    // Só verificar as chaves reais, não as de teste
    const commonKeys = ['app.title', 'moneyflow.title'];
    
    // Verificar se as chaves comuns existem em todos os idiomas
    commonKeys.forEach(key => {
      expect(result.enKeys).toContain(key);
      expect(result.ptKeys).toContain(key);
      expect(result.esKeys).toContain(key);
    });
    
    // Verificar que não há chaves extras em pt ou es
    expect(result.ptKeys.length).toBe(result.enKeys.length);
    expect(result.esKeys.length).toBe(result.enKeys.length);
  });

  it('should initialize i18n correctly through the setupI18n function', () => {
    // Set a saved preference to test getInitialLocale
    localStorageMock['preferredLanguage'] = 'es';
    
    // Execute setupI18n
    i18nModule.setupI18n();
    
    // Verify that init was called with correct settings
    expect(init).toHaveBeenCalledWith({
      fallbackLocale: 'en',
      initialLocale: 'es'
    });
  });

  it('should use localStorage preference when available', () => {
    // Set a language preference in localStorage
    localStorageMock['preferredLanguage'] = 'pt';
    
    // Create a new i18n instance and initialize
    const i18n = i18nModule.createI18nStore();
    i18n.initialize();
    
    // Verify that localStorage method was called and locale was set
    expect(Storage.prototype.getItem).toHaveBeenCalledWith('preferredLanguage');
    expect(locale.set).toHaveBeenCalledWith('pt');
  });

  it('should use browser language when there is no preference in localStorage', () => {
    // Ensure there is no saved preference
    localStorageMock = {};
    
    // Set browser language
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('es-ES');
    
    // Create new instance and initialize
    const i18n = i18nModule.createI18nStore();
    i18n.initialize();
    
    // Verify that preference was stored based on browser language
    expect(Storage.prototype.setItem).toHaveBeenCalledWith('preferredLanguage', 'es');
    expect(locale.set).toHaveBeenCalledWith('es');
  });
});