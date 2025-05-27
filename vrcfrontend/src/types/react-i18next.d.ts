// Disable strict typing for react-i18next to make development easier
import 'react-i18next';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    returnNull: false;
    returnEmptyString: false;
    nsSeparator: false;
    keySeparator: false;
    interpolation: {
      escapeValue: false;
    };
  }
}
