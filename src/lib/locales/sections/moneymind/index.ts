// Arquivo de exportação para todas as traduções relacionadas ao MoneyMind
import coinsMetalTranslations from './coinsmetal';
import paperDigitalTranslations from './paperdigital';
import philosophyTranslations from './philosophy';
import coinsMetalTranslationsEn from './coinsmetal.en';
import paperDigitalTranslationsEn from './paperdigital.en';
import philosophyTranslationsEn from './philosophy.en';
import philosophyTranslationsEs from './philosophy.es';
import coinsMetalTranslationsEs from './coinsmetal.es';
import paperDigitalTranslationsEs from './paperdigital.es';
import primitiveorigins from './primitiveorigins';
import primitiveoriginsEn from './primitiveorigins.en';
import primitiveoriginsEs from './primitiveorigins.es';
import moneymindPt from './pt';
import moneymindEn from './en';
import moneymindEs from './es';

// Combina todas as traduções em um único objeto
const moneymindTranslations = {
  pt: {
    ...moneymindPt,
    ...coinsMetalTranslations,
    ...paperDigitalTranslations,
    ...philosophyTranslations,
    ...primitiveorigins
  },
  en: {
    ...moneymindEn,
    ...coinsMetalTranslationsEn,
    ...paperDigitalTranslationsEn,
    ...philosophyTranslationsEn,
    ...primitiveoriginsEn
  },  
  es: {
    ...moneymindEs,
    // Adicionando as traduções em espanhol para a seção de filosofia
    ...philosophyTranslationsEs,
    // Adicionando as novas traduções em espanhol
    ...coinsMetalTranslationsEs,
    ...paperDigitalTranslationsEs,
    ...primitiveoriginsEs
    // Quando mais versões em espanhol estiverem disponíveis, adicionar aqui
  }
};

export default moneymindTranslations;
