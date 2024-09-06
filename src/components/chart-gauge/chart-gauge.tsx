import { Component, Prop, Element, h } from '@stencil/core';
import * as d3 from 'd3';

@Component({
  tag: 'chart-gauge',
  styleUrl: 'chart-gauge.css',
  shadow: true,
})

export class GaugeChart {
  @Element() el: HTMLElement;

  @Prop() settings: Array<{ name: string; from: number; to: number; color: string }> = [];
  @Prop() value: number;
  @Prop() label: string;
  @Prop() distance: number;
  @Prop() width: number;
  @Prop() tooltip: string;

  private svg: any;
  private chart: any;

  get min(): number {
    return this.settings.length > 0 ? this.settings[0].from : 0;
  }

  get max(): number {
    return this.settings.length > 0 ? this.settings[this.settings.length - 1].to : 100;
  }

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

    const chartGauge = this.el.shadowRoot.querySelector('.gauge-chart');
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

      const sectionStart = (sectionIndx - 1) * this.distance;
      const sectionEnd = sectionIndx * this.distance;

      // Find all settings that overlap with this section
      const relevantSettings = this.settings.filter(s => 
        (s.from < sectionEnd && s.to > sectionStart)
      );

      // Calculate fill percentages for each color in this section
      let fillPercentages = [];
      let colors = [];

      relevantSettings.forEach(setting => {
        const start = Math.max(setting.from, sectionStart);
        const end = Math.min(setting.to, sectionEnd);
        const percentage = (end - start) / this.distance;
        fillPercentages.push(percentage);
        colors.push(setting.color);
      });

      // If the section is not fully covered, add gray for the remaining part
      const totalPercentage = fillPercentages.reduce((a, b) => a + b, 0);
      if (totalPercentage < 1) {
        fillPercentages.push(1 - totalPercentage);
        colors.push('#ccc');
      }

      // Create a gradient for multi-color fill
      const gradientId = `gradient-${sectionIndx}`;
      const gradient = this.chart.append('linearGradient')
        .attr('id', gradientId)
        .attr('gradientUnits', 'objectBoundingBox')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');

      let currentOffset = 0;
      fillPercentages.forEach((percentage, index) => {
        if (percentage > 0) {
          gradient.append('stop')
            .attr('offset', `${currentOffset * 100}%`)
            .attr('stop-color', colors[index]);
          
          currentOffset += percentage;
          
          gradient.append('stop')
            .attr('offset', `${currentOffset * 100}%`)
            .attr('stop-color', colors[index]);
        }
      });

      this.chart.append('path')
        .attr('class', `arc chart-color${sectionIndx}`)
        .attr('d', arc)
        .attr('fill', `url(#${gradientId})`);

      const labelAngle = (arcStartRad + arcEndRad) / 2;
      const labelRadius = radius - chartInset + 20;
      const labelX = labelRadius * Math.cos(labelAngle - Math.PI / 2);
      const labelY = labelRadius * Math.sin(labelAngle - Math.PI / 2);

      if (sectionEnd !== this.min && sectionEnd !== this.max) {
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
          .text(sectionEnd);
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

    // Add tooltip
    if (this.tooltip) {
      const tooltipElement = this.chart.append('g')
        .attr('class', 'gauge-tooltip')
        .attr('transform', `translate(0, ${radius / 4})`)
        .style('opacity', 0);

      const tooltipText = tooltipElement.append('text')
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .text(this.tooltip);

      const bbox = tooltipText.node().getBBox();
      const padding = 10;

      tooltipElement.insert('rect', 'text')
        .attr('x', bbox.x - padding / 2)
        .attr('y', bbox.y - padding / 2)
        .attr('width', bbox.width + padding)
        .attr('height', bbox.height + padding)
        .attr('rx', 5)
        .attr('ry', 5)
        .style('fill', 'white')
        .style('stroke', '#333')
        .style('stroke-width', 1);

      this.chart.on('mouseover', () => {
        tooltipElement.transition()
          .duration(100)
          .style('opacity', 1);
      })
      .on('mouseout', () => {
        tooltipElement.transition()
          .duration(500)
          .style('opacity', 0);
      });
    }
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
    return <div class="gauge-chart" style={{ width: `${this.width}px` }}></div>;
  }
}