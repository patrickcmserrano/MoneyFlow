// Arquivo de exportação para todas as traduções relacionadas ao MoneyMind
import coinsMetalTranslations from './coinsmetal';
import paperDigitalTranslations from './paperdigital';
import philosophyTranslations from './philosophy';
import coinsMetalTranslationsEn from './coinsmetal.en';
import paperDigitalTranslationsEn from './paperdigital.en';
import philosophyTranslationsEn from './philosophy.en';
import * as moneymindPt from './pt';
import * as moneymindEn from './en';
import moneymindEs from './es';

// Combina todas as traduções em um único objeto
const moneymindTranslations = {
  pt: {
    ...moneymindPt,
    ...coinsMetalTranslations,
    ...paperDigitalTranslations,
    ...philosophyTranslations
  },
  en: {
    ...moneymindEn,
    ...coinsMetalTranslationsEn,
    ...paperDigitalTranslationsEn,
    ...philosophyTranslationsEn
  },
  es: {
    ...moneymindEs
    // Quando as versões em espanhol estiverem disponíveis, adicionar aqui
  }
};

export default moneymindTranslations;
