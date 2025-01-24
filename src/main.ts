import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useGoogleTagManager } from '@/composables/useGoogleTagManager'
import { useConsentStore } from '@/stores/consent'

const app = createApp(App)

app.use(createPinia())
app.use(router)

useGoogleTagManager(window, document, 'script', 'dataLayer', 'GTM-ND26GJFT', router)
window.dataLayer.push({
  event: 'evento_personalizado',
})
const consent = useConsentStore()
consent.loadSavedConsent()

app.mount('#app')
