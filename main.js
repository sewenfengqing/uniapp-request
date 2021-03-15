import Vue from 'vue'
import App from './App'
import Http from './common/http.js'

Vue.config.productionTip = false
Vue.prototype.Http = Http 


App.mpType = 'app'

const app = new Vue({
		Http,
    ...App
})
app.$mount()
