import app from './sections/app/es.ts';
import moneyflow from './sections/moneyflow/es.ts';
import moneymind from './sections/moneymind/es.ts';
import navigation from './sections/navigation/es.ts';
import debug from './sections/debug/es.ts';

export default Object.assign({}, app, moneyflow, moneymind, navigation, debug);
