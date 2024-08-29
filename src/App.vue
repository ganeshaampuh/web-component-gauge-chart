<template>
  <div id="app">
    <Gauge :value="value" :min="min" :max="max" :distance="distance" :settings="settings" />
  </div>
</template>

<script>
import Gauge from './components/Gauge.vue'

export default {
  name: 'App',
  components: {
    Gauge
  },
  data() {
    return {  
      value: 40,
      min: 0,
      max: 80,
      distance: 10,
      settings: [
        {
          name: "green",
          from: 0,
          to: 40,
          color: '#54bc3a',
        },
        {
          name: "yellow",
          from: 40,
          to: 50,
          color: '#dcdf0f',
        },
        {
          name: "red",
          from: 50,
          to: 80,
          color: '#de5354',
        }
      ],
    }
  },
}
</script>
