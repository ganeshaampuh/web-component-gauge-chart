import { Component, Prop, Element, h } from '@stencil/core';
import * as d3 from 'd3';

@Component({
  tag: 'chart-gauge',
  styleUrl: 'chart-gauge.css',
  shadow: true,
})

export class GaugeChart {
  @Element() el: HTMLElement;

  @Prop() settings: Array<{ from: number; to: number; color: string }> = [];
  @Prop() value: number;
  @Prop() label: string;
  @Prop() min: number;
  @Prop() max: number;
  @Prop() distance: number;
  @Prop() width: number;

  private svg: any;
  private chart: any;

  componentDidLoad() {
    this.drawChart();
  }

  drawChart() {
    const percent = this.value / this.max;
    const barWidth = 20;
    const numSections = this.max / this.distance;
    const sectionPerc = 1 / numSections / 2;
    const padRad = 0.05;
    const chartInset = 10;
    let totalPercent = 0.75;

    const margin = {
      top: 20,
      right: 20,
      bottom: 30,
      left: 20
    };

    const chartGauge = this.el.shadowRoot.querySelector('.chart-gauge');
    const width = this.width - margin.left - margin.right;
    const height = width;
    const radius = Math.min(width, height) / 2;

    this.svg = d3.select(chartGauge)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    this.chart = this.svg.append('g')
      .attr('transform', `translate(${(width + margin.left) / 2}, ${(height + margin.top) / 2 + 10})`);

    for (let sectionIndx = 1; sectionIndx <= numSections; sectionIndx++) {
      const arcStartRad = this.percToRad(totalPercent);
      const arcEndRad = arcStartRad + this.percToRad(sectionPerc);
      totalPercent += sectionPerc;
      const startPadRad = sectionIndx === 1 ? 0 : padRad / 2;
      const endPadRad = sectionIndx === numSections ? 0 : padRad / 2;
      const arc = d3.arc()
        .outerRadius(radius - chartInset)
        .innerRadius(radius - chartInset - barWidth)
        .startAngle(arcStartRad + startPadRad)
        .endAngle(arcEndRad - endPadRad);

      const sectionValue = sectionIndx * this.distance;
      const setting = this.settings.find(s => sectionValue >= s.from && sectionValue <= s.to);
      const color = setting ? setting.color : '#ccc';

      this.chart.append('path')
        .attr('class', `arc chart-color${sectionIndx}`)
        .attr('d', arc)
        .attr('fill', color);

      const labelAngle = (arcStartRad + arcEndRad) / 2;
      const labelRadius = radius - chartInset + 20;
      const labelX = labelRadius * Math.cos(labelAngle - Math.PI / 2);
      const labelY = labelRadius * Math.sin(labelAngle - Math.PI / 2);

      if (sectionValue !== this.min && sectionValue !== this.max) {
        const rotationAngle = -10;
        const radians = this.degToRad(rotationAngle);
        const adjustedLabelX = labelX * Math.cos(radians) + labelY * Math.sin(radians);
        const adjustedLabelY = -labelX * Math.sin(radians) + labelY * Math.cos(radians);

        this.chart.append('text')
          .attr('class', 'gauge-label')
          .attr('x', adjustedLabelX)
          .attr('y', adjustedLabelY)
          .attr('text-anchor', 'middle')
          .attr('alignment-baseline', 'middle')
          .text(sectionValue);
      }
    }

    this.drawNeedle(percent);

    this.chart.append('text')
      .attr('class', 'gauge-value')
      .attr('x', 0)
      .attr('y', radius / 2)
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .text(`${this.value} ${this.label}`);

    this.chart.append('text')
      .attr('class', 'gauge-label')
      .attr('x', -radius - 10)
      .attr('y', -5)
      .attr('text-anchor', 'start')
      .attr('alignment-baseline', 'middle')
      .text(this.min);

    this.chart.append('text')
      .attr('class', 'gauge-label')
      .attr('x', radius + 10)
      .attr('y', -5)
      .attr('text-anchor', 'start')
      .attr('alignment-baseline', 'middle')
      .text(this.max);
  }

  drawNeedle(percent) {
    const len = 75;
    const radius = 10;

    const centerX = 0;
    const centerY = 0;

    const thetaRad = this.percToRad(percent / 2);

    const topX = centerX - len * Math.cos(thetaRad);
    const topY = centerY - len * Math.sin(thetaRad);
    const leftX = centerX - radius * Math.cos(thetaRad - Math.PI / 2);
    const leftY = centerY - radius * Math.sin(thetaRad - Math.PI / 2);
    const rightX = centerX - radius * Math.cos(thetaRad + Math.PI / 2);
    const rightY = centerY - radius * Math.sin(thetaRad + Math.PI / 2);

    const path = `M ${leftX} ${leftY} L ${topX} ${topY} L ${rightX} ${rightY}`;

    this.chart.append('circle')
      .attr('class', 'needle-center')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', radius);

    this.chart.append('path')
      .attr('class', 'needle')
      .attr('d', path);

    this.animateNeedle(percent);
  }

  animateNeedle(percent) {
    const self = this;
    this.chart.selectAll('.needle')
      .transition()
      .delay(500)
      .ease(d3.easeElastic)
      .duration(3000)
      .tween('progress', function() {
        return function(percentOfPercent) {
          const progress = percentOfPercent * percent;
          const thetaRad = self.percToRad(progress / 2);
          const topX = -75 * Math.cos(thetaRad);
          const topY = -75 * Math.sin(thetaRad);
          const leftX = -10 * Math.cos(thetaRad - Math.PI / 2);
          const leftY = -10 * Math.sin(thetaRad - Math.PI / 2);
          const rightX = -10 * Math.cos(thetaRad + Math.PI / 2);
          const rightY = -10 * Math.sin(thetaRad + Math.PI / 2);
          const path = `M ${leftX} ${leftY} L ${topX} ${topY} L ${rightX} ${rightY}`;
          d3.select(this).attr('d', path);
        };
      });
  }

  percToDeg(perc: number): number {
    return perc * 360;
  }

  percToRad(perc: number): number {
    return this.degToRad(this.percToDeg(perc));
  }

  degToRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }

  render() {
    return <div class="chart-gauge" style={{ width: `${this.width}px` }}></div>;
  }
}