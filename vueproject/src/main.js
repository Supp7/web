import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/theme-chalk/index.css'
import App from './App.vue'
import router from './router'
import store from './store'
import Vue from "@vue/cli-plugin-eslint/eslintOptions";


createApp(App).use(store).use(router).use(ElementPlus).mount('#app')
Vue.config.productionTip = false

