import Vue from 'vue'
import App from './App.vue'
import vueCustomElement from 'vue-custom-element'
import GaugeChart from './components/GaugeChart.vue'

Vue.use(vueCustomElement)
Vue.customElement('gauge-chart', GaugeChart)

new Vue({
  render: h => h(App),
}).$mount('#app')
