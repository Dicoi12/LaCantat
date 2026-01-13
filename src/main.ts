import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import router from './router';
import Aura from '@primeuix/themes/aura';
import 'primeicons/primeicons.css'
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import { useAuth } from './composables/useAuth';

const app = createApp(App)

app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
})

app.use(router)
app.use(ToastService)
app.use(ConfirmationService)

// Inițializează autentificarea înainte de mount
const { initAuth } = useAuth()
initAuth().then(() => {
    app.mount('#app')
})
    