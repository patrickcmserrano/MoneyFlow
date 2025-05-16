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
    'moneyflow.legend.electronic': 'Electronic Money',
    'moneyflow.animation.highlight': 'Highlight Important Flows',
    'moneyflow.animation.step_mode': 'Step-by-Step Mode',
    'moneyflow.animation.next_step': 'Next Step',
    'moneyflow.animation.reset': 'Reset',
    'moneyflow.animation.play': 'Play Animation',
    'moneyflow.animation.stop': 'Stop Animation',
    'moneyflow.animation.speed': 'Animation Speed',
    // Data sources translations
    'moneyflow.datasources.title': 'Data Sources',
    'moneyflow.datasources.gdp.title': 'GDP & Economic Activity',
    'moneyflow.datasources.gdp.description': 'Gross Domestic Product (GDP) data and economic activity indicators provide the foundation for understanding the scale of financial flows.',
    'moneyflow.datasources.trade.title': 'International Trade',
    'moneyflow.datasources.trade.description': 'Import and export data showing Brazil\'s commercial interaction with the global market.',
    'moneyflow.datasources.exchange.title': 'Exchange Rates',
    'moneyflow.datasources.exchange.description': 'Historical exchange rates used to convert international values to Brazilian Reais (BRL).',
    'moneyflow.datasources.revenue.title': 'Government Revenue',
    'moneyflow.datasources.revenue.description': 'Tax collection and other government revenue sources that form the basis of fiscal policy.',
    'moneyflow.datasources.money.title': 'Money Supply',
    'moneyflow.datasources.money.description': 'Data on physical currency in circulation and electronic money in the banking system.',
    'moneyflow.datasources.disclaimer.title': 'Data Processing Note',
    'moneyflow.datasources.disclaimer.description': 'This visualization uses real data from official sources, but simplifies complex financial relationships for educational purposes. Some relationships between flows are estimated based on economic models.',
    'moneyflow.datasources.source': 'Source'
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
    'moneyflow.legend.electronic': 'Dinheiro Eletrônico',
    'moneyflow.animation.highlight': 'Destacar Fluxos Importantes',
    'moneyflow.animation.step_mode': 'Modo Passo a Passo',
    'moneyflow.animation.next_step': 'Próximo Passo',
    'moneyflow.animation.reset': 'Reiniciar',
    'moneyflow.animation.play': 'Iniciar Animação',
    'moneyflow.animation.stop': 'Parar Animação',
    'moneyflow.animation.speed': 'Velocidade',
    'moneyflow.datasources.title': 'Fontes de Dados',
    'moneyflow.datasources.gdp.title': 'PIB & Atividade Econômica',
    'moneyflow.datasources.gdp.description': 'Dados do Produto Interno Bruto (PIB) e indicadores de atividade econômica fornecem a base para entender a escala dos fluxos financeiros.',
    'moneyflow.datasources.trade.title': 'Comércio Internacional',
    'moneyflow.datasources.trade.description': 'Dados de importação e exportação mostrando a interação comercial do Brasil com o mercado global.',
    'moneyflow.datasources.exchange.title': 'Taxas de Câmbio',
    'moneyflow.datasources.exchange.description': 'Taxas de câmbio históricas usadas para converter valores internacionais para Reais (BRL).',
    'moneyflow.datasources.revenue.title': 'Receita Governamental',
    'moneyflow.datasources.revenue.description': 'Arrecadação de impostos e outras fontes de receita do governo que formam a base da política fiscal.',
    'moneyflow.datasources.money.title': 'Oferta de Moeda',
    'moneyflow.datasources.money.description': 'Dados sobre moeda física em circulação e dinheiro eletrônico no sistema bancário.',
    'moneyflow.datasources.disclaimer.title': 'Nota sobre Processamento de Dados',
    'moneyflow.datasources.disclaimer.description': 'Esta visualização utiliza dados reais de fontes oficiais, mas simplifica relações financeiras complexas para fins educacionais. Algumas relações entre fluxos são estimadas com base em modelos econômicos.',
    'moneyflow.datasources.source': 'Fonte'
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
    'moneyflow.legend.electronic': 'Dinero Electrónico',
    'moneyflow.animation.highlight': 'Destacar Flujos Principales',
    'moneyflow.animation.step_mode': 'Modo Paso a Paso',
    'moneyflow.animation.next_step': 'Siguiente Paso',
    'moneyflow.animation.reset': 'Reiniciar',
    'moneyflow.animation.play': 'Reproducir Animación',
    'moneyflow.animation.stop': 'Detener Animación',
    'moneyflow.animation.speed': 'Velocidad',
    'moneyflow.datasources.title': 'Fuentes de Datos',
    'moneyflow.datasources.gdp.title': 'PIB & Actividad Económica',
    'moneyflow.datasources.gdp.description': 'Los datos del Producto Interno Bruto (PIB) y los indicadores de actividad económica proporcionan la base para comprender la escala de los flujos financieros.',
    'moneyflow.datasources.trade.title': 'Comercio Internacional',
    'moneyflow.datasources.trade.description': 'Datos de importación y exportación que muestran la interacción comercial de Brasil con el mercado global.',
    'moneyflow.datasources.exchange.title': 'Tasas de Cambio',
    'moneyflow.datasources.exchange.description': 'Tasas de cambio históricas utilizadas para convertir valores internacionales a Reales brasileños (BRL).',
    'moneyflow.datasources.revenue.title': 'Ingresos Gubernamentales',
    'moneyflow.datasources.revenue.description': 'Recaudación de impuestos y otras fuentes de ingresos gubernamentales que forman la base de la política fiscal.',
    'moneyflow.datasources.money.title': 'Oferta Monetaria',
    'moneyflow.datasources.money.description': 'Datos sobre moneda física en circulación y dinero electrónico en el sistema bancario.',
    'moneyflow.datasources.disclaimer.title': 'Nota sobre Procesamiento de Datos',
    'moneyflow.datasources.disclaimer.description': 'Esta visualización utiliza datos reales de fuentes oficiales, pero simplifica relaciones financeiras complexas com fins educativos. Algumas relações entre fluxos são estimadas com base em modelos econômicos.',
    'moneyflow.datasources.source': 'Fuente',
    'trendchart.title': 'Tendencias de Flujo Monetario (2020-2025)',
    'trendchart.xaxis': 'Año',
    'trendchart.yaxis': 'Volumen (BRL)',
    'trendchart.select_metric': 'Seleccionar métrica',
    'trendchart.description': 'Este gráfico muestra cómo han cambiado las diferentes categorías de flujo monetario a lo largo del tiempo, basado en datos econômicos reais e projeções.',
    'trendchart.metrics.total': 'Flujo Monetario Total',
    'trendchart.metrics.physical': 'Moneda Física',
    'trendchart.metrics.electronic': 'Dinero Electrónico',
    'trendchart.metrics.government': 'Flujos Gubernamentales',
    'trendchart.metrics.external': 'Flujos de Mercado Externo'
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