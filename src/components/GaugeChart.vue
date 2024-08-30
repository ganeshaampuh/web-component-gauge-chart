<template>
  <div class="chart-gauge" />
</template>

<script>
import * as d3 from "d3";

export default {
  name: 'Gauge',
  props: {
    settings: {
      type: Array,
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    value_label: {
      type: String,
      required: true
    },
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    },
    distance: {
      type: Number,
      required: true
    }
  },
  methods: {
    drawChart() {
      var Needle, arc, arcEndRad, arcStartRad, barWidth, chart, chartInset, degToRad, el, endPadRad, height, i, margin, needle, numSections, padRad, percToDeg, percToRad, percent, radius, ref, sectionIndx, sectionPerc, startPadRad, svg, totalPercent, width;

      percent = this.value / this.max;

      barWidth = 20;

      numSections = this.max / this.distance;

      sectionPerc = 1 / numSections / 2;

      padRad = 0.05;

      chartInset = 10;

      totalPercent = .75;

      el = d3.select('.chart-gauge');

      margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 20
      };

      width = el.node().offsetWidth - margin.left - margin.right;

      height = width;

      radius = Math.min(width, height) / 2;

      percToDeg = function (perc) {
        return perc * 360;
      };

      percToRad = function (perc) {
        return degToRad(percToDeg(perc));
      };

      degToRad = function (deg) {
        return deg * Math.PI / 180;
      };

      svg = el.append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom);

      chart = svg.append('g').attr('transform', "translate(" + ((width + margin.left) / 2) + ", " + ((height + margin.top) / 2 + 10) + ")");

      for (sectionIndx = i = 1, ref = numSections; 1 <= ref ? i <= ref : i >= ref; sectionIndx = 1 <= ref ? ++i : --i) {
        arcStartRad = percToRad(totalPercent);
        arcEndRad = arcStartRad + percToRad(sectionPerc);
        totalPercent += sectionPerc;
        startPadRad = sectionIndx === 0 ? 0 : padRad / 2;
        endPadRad = sectionIndx === numSections ? 0 : padRad / 2;
        arc = d3.arc().outerRadius(radius - chartInset).innerRadius(radius - chartInset - barWidth).startAngle(arcStartRad + startPadRad).endAngle(arcEndRad - endPadRad);
        
        const sectionValue = sectionIndx * this.distance;
        const setting = this.settings.find(s => sectionValue >= s.from && sectionValue <= s.to);
        const color = setting ? setting.color : '#ccc';

        chart.append('path')
          .attr('class', "arc chart-color" + sectionIndx)
          .attr('d', arc)
          .attr('fill', color);

        const labelAngle = (arcStartRad + arcEndRad) / 2;
        const labelRadius = radius - chartInset + 20;
        const labelX = labelRadius * Math.cos(labelAngle - Math.PI / 2);
        const labelY = labelRadius * Math.sin(labelAngle - Math.PI / 2);
        
        if (sectionValue !== this.min && sectionValue !== this.max) {
          const rotationAngle = -10;
          const radians = rotationAngle * Math.PI / 180;
          const adjustedLabelX = labelX * Math.cos(radians) + labelY * Math.sin(radians);
          const adjustedLabelY = -labelX * Math.sin(radians) + labelY * Math.cos(radians);
          
          chart.append('text')
            .attr('class', 'gauge-label')
            .attr('x', adjustedLabelX)
            .attr('y', adjustedLabelY)
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .text(sectionValue);
        }
      }

      Needle = (function () {
        function Needle(len, radius1) {
          this.len = len;
          this.radius = radius1;
        }

        Needle.prototype.drawOn = function (el, perc) {
          el.append('circle').attr('class', 'needle-center').attr('cx', 0).attr('cy', 0).attr('r', this.radius);
          return el.append('path').attr('class', 'needle').attr('d', this.mkCmd(perc));
        };

        Needle.prototype.animateOn = function (el, perc) {
          var self;
          self = this;
          return el.transition().delay(500).ease(d3.easeElastic).duration(3000).selectAll('.needle').tween('progress', function () {
            return function (percentOfPercent) {
              var progress;
              progress = percentOfPercent * perc;
              return d3.select(this).attr('d', self.mkCmd(progress));
            };
          });
        };

        Needle.prototype.mkCmd = function (perc) {
          var centerX, centerY, leftX, leftY, rightX, rightY, thetaRad, topX, topY;
          thetaRad = percToRad(perc / 2);
          centerX = 0;
          centerY = 0;
          topX = centerX - this.len * Math.cos(thetaRad);
          topY = centerY - this.len * Math.sin(thetaRad);
          leftX = centerX - this.radius * Math.cos(thetaRad - Math.PI / 2);
          leftY = centerY - this.radius * Math.sin(thetaRad - Math.PI / 2);
          rightX = centerX - this.radius * Math.cos(thetaRad + Math.PI / 2);
          rightY = centerY - this.radius * Math.sin(thetaRad + Math.PI / 2);
          return "M " + leftX + " " + leftY + " L " + topX + " " + topY + " L " + rightX + " " + rightY;
        };

        return Needle;

      })();

      needle = new Needle(75, 10);

      needle.drawOn(chart, 0);

      needle.animateOn(chart, percent);

      chart.append('text')
        .attr('class', 'gauge-value')
        .attr('x', 0)
        .attr('y', radius / 2)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .text(`${this.value} ${this.value_label}`);

      chart.append('text')
        .attr('class', 'gauge-label')
        .attr('x', -radius - 10)
        .attr('y', -5)
        .attr('text-anchor', 'start')
        .attr('alignment-baseline', 'middle')
        .text(this.min);

      chart.append('text')
        .attr('class', 'gauge-label')
        .attr('x', radius + 10)
        .attr('y', -5)
        .attr('text-anchor', 'start')
        .attr('alignment-baseline', 'middle')
        .text(this.max);
    }
  },
  mounted() {
    this.drawChart();
  }
}
</script>

<style lang="scss">
.chart-gauge {
  width: 300px;
  margin: 20px auto;
}

.needle,
.needle-center {
  fill: #464A4F;
}

.gauge-label {
  font-size: 12px;
  fill: #333;
}

.gauge-value {
  font-size: 16px;
  font-weight: bold;
  fill: #333;
}
</style>