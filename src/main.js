import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.provide("axios", app.config.globalProperties.axios)
app.config.globalProperties.$BMapGL = window.BMapGL

app.mount('#app');
