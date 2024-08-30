import Vue from 'vue'
import App from './App.vue'
import GaugeChart from './components/GaugeChart.vue'
import vueCustomElement from 'vue-custom-element'

Vue.use(vueCustomElement)
Vue.customElement('gauge-chart', GaugeChart)

new Vue({
  render: h => h(App),
}).$mount('#app')
