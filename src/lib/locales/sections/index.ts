// Arquivo principal que exporta todas as traduções de seções
import moneymindTranslations from './moneymind';
import navigationTranslations from './navigation';
import moneyflowTranslations from './moneyflow';
import appTranslations from './app';
import debugTranslations from './debug';

// Combina todas as traduções de seções
const sectionTranslations = {
  pt: {
    ...moneymindTranslations.pt,
    ...navigationTranslations.pt,
    ...moneyflowTranslations.pt,
    ...appTranslations.pt,
    ...debugTranslations.pt
  },
  en: {
    ...moneymindTranslations.en,
    ...navigationTranslations.en,
    ...moneyflowTranslations.en,
    ...appTranslations.en,
    ...debugTranslations.en
  },
  es: {
    ...moneymindTranslations.es,
    ...navigationTranslations.es,
    ...moneyflowTranslations.es,
    ...appTranslations.es,
    ...debugTranslations.es
  }
};

export default sectionTranslations;
