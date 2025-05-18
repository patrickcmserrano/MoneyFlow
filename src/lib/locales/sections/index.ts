// Arquivo principal que exporta todas as traduções de seções
import moneymindTranslations from './moneymind';
import navigationTranslations from './navigation';
import moneyflowTranslations from './moneyflow';
import appTranslations from './app';
import debugTranslations from './debug';
import featuresTranslations from './features';

// Combina todas as traduções de seções
const sectionTranslations = {  pt: {
    ...moneymindTranslations.pt,
    ...navigationTranslations.pt,
    ...moneyflowTranslations.pt,
    ...appTranslations.pt,
    ...debugTranslations.pt,
    ...featuresTranslations.pt
  },  en: {
    ...moneymindTranslations.en,
    ...navigationTranslations.en,
    ...moneyflowTranslations.en,
    ...appTranslations.en,
    ...debugTranslations.en,
    ...featuresTranslations.en
  },  es: {
    ...moneymindTranslations.es,
    ...navigationTranslations.es,
    ...moneyflowTranslations.es,
    ...appTranslations.es,
    ...debugTranslations.es,
    ...featuresTranslations.es
  }
};

export default sectionTranslations;
