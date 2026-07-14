import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import {initReactI18next} from 'react-i18next'

import en from './locales/en/translation.json'
import ru from './locales/ru/translation.json'

void i18next
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources: {
			ru: { translation: ru },
			en: { translation: en },
		},
		lng: 'en',
		fallbackLng: 'en',
		supportedLngs: ['ru', 'en'],
		interpolation: { escapeValue: false },
	})

export default i18next
