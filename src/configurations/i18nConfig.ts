import i18n from 'i18next'
import {initReactI18next} from 'react-i18next'

import pt from '../languages/pt.json';
import en from '../languages/en.json';

i18n.use(initReactI18next).init({
    lng: "pt",
    fallbackLng: "en",
    resources:{
        pt:{translation:pt},
        en:{translation:en},
    },
    interpolation:{
        escapeValue: false,
    },
    
});

export default i18n;