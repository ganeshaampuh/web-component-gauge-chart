import { Component, Prop, Element, h, State, Watch } from '@stencil/core';
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
  @Prop() width: number = 400;
  @Prop() height: number = 300;
  @Prop() units: string = '';
  @Prop() tickInterval: number = 10;
  @Prop() lineColor: string = '#C0C0C0';
  @Prop() tickColor: string = '#C0C0C0';
  @Prop() needleColor: string = '#464A4F';
  @Prop() pivotColor: string = '#464A4F';
  @Prop() tooltip: string = '';

  get minValue(): number {
    return this.settings.length > 0 ? this.settings[0].from : 0;
  }

  get maxValue(): number {
    return this.settings.length > 0 ? this.settings[this.settings.length - 1].to : 0;
  }

  @State() private svg: any;
  @State() private chart: any;
  @State() private needle: any;
  @State() private valueText: any;
  @State() private tooltipElement: any;

  @Watch('value')
  valueChanged(newValue: number) {
    if (this.needle) {
      this.updateNeedle(newValue);
    }
    if (this.valueText) {
      this.updateValueText(newValue);
    }
  }

  componentDidLoad() {
    this.drawChart();
  }

  drawChart() {
    const margin = { top: 20, right: 25, bottom: 20, left: 25 };
    const width = this.width - margin.left - margin.right;
    const height = this.height - margin.top - margin.bottom;
    const radius = Math.min(width, height) / 2;

    this.svg = d3.select(this.el.shadowRoot.querySelector('.gauge-chart'))
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    this.chart = this.svg.append('g')
      .attr('transform', `translate(${this.width / 2}, ${this.height / 2})`);

    this.drawArc(radius);
    this.drawTicks(radius);
    this.drawNeedle(radius);
    this.drawLabels(radius);
    this.drawTooltip();
  }

  drawArc(radius: number) {
    const arc = d3.arc()
      .innerRadius(radius * 0.85)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2);

    this.chart.append('path')
      .attr('class', 'arc')
      .attr('d', arc)
      .attr('fill', '#EFEFEF');

    const totalAngle = Math.PI;
    const availableAngle = totalAngle;

    let startAngle = -Math.PI / 2;

    this.settings.forEach((setting) => {
      const settingRange = setting.to - setting.from;
      const settingAngle = (settingRange / (this.maxValue - this.minValue)) * availableAngle;

      const colorArc = d3.arc()
        .innerRadius(radius * 0.85)
        .outerRadius(radius)
        .startAngle(startAngle)
        .endAngle(startAngle + settingAngle);

      this.chart.append('path')
        .attr('class', 'color-arc')
        .attr('d', colorArc)
        .attr('fill', setting.color);

      startAngle += settingAngle;
    });
  }

  drawTicks(radius: number) {
    const scale = d3.scaleLinear()
      .domain([this.minValue, this.maxValue])
      .range([-Math.PI / 2, Math.PI / 2]);

    const ticks = scale.ticks(this.tickInterval);

    const tickArc = d3.arc()
      .innerRadius(radius * 0.68)
      .outerRadius(radius * 0.7)
      .startAngle(d => scale(d))
      .endAngle(d => scale(d));

    this.chart.selectAll('.tick')
      .data(ticks)
      .enter().append('path')
      .attr('class', 'tick')
      .attr('d', tickArc)
      .attr('fill', this.tickColor);

    this.chart.selectAll('.tick-line')
      .data(ticks)
      .enter().append('line')
      .attr('class', 'tick-line')
      .attr('x1', d => (radius * 0.7) * Math.cos(scale(d) - Math.PI / 2))
      .attr('y1', d => (radius * 0.7) * Math.sin(scale(d) - Math.PI / 2))
      .attr('x2', d => radius * Math.cos(scale(d) - Math.PI / 2))
      .attr('y2', d => radius * Math.sin(scale(d) - Math.PI / 2))
      .attr('stroke', 'white')
      .attr('stroke-width', 1.5);

    this.chart.selectAll('.tick-text')
      .data(ticks)
      .enter().append('text')
      .attr('class', 'tick-text')
      .attr('x', d => (radius * 1.1) * Math.cos(scale(d) - Math.PI / 2))
      .attr('y', d => (radius * 1.1) * Math.sin(scale(d) - Math.PI / 2))
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', '12px')
      .text(d => d);
  }

  drawNeedle(radius: number) {
    const needleLength = radius * 0.7;
    const needleRadius = 7;

    this.needle = this.chart.append('g')
      .attr('class', 'needle');

    this.needle.append('circle')
      .attr('class', 'needle-center')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', needleRadius)
      .attr('fill', this.pivotColor);

    this.needle.append('path')
      .attr('class', 'needle-path')
      .attr('d', `M 0 ${-needleLength} L ${-needleRadius} 0 L ${needleRadius} 0 Z`)
      .attr('fill', this.needleColor);

    this.updateNeedle(this.value);
  }

  updateNeedle(value: number) {
    const angle = this.scaleValue(value);
    this.needle.transition()
      .duration(1000)
      .attrTween('transform', () => {
        const interpolate = d3.interpolate(this.scaleValue(this.value), angle);
        return (t) => `rotate(${(interpolate(t) * 180 / Math.PI)})`;
      });
  }

  drawLabels(radius: number) {
    this.valueText = this.chart.append('text')
      .attr('class', 'value-text')
      .attr('x', 0)
      .attr('y', radius * 0.3)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', '14px')
      .attr('fill', '#000000')
      .text(`${this.value} ${this.label}`);
  }

  updateValueText(value: number) {
    this.valueText.text(`${value}${this.units}`);
  }

  scaleValue(value: number): number {
    return d3.scaleLinear()
      .domain([this.minValue, this.maxValue])
      .range([-Math.PI / 2, Math.PI / 2])(value);
  }

  drawTooltip() {
    if (this.tooltip) {
      const tooltipGroup = this.chart.append('g')
        .attr('class', 'tooltip-group')
        .attr('transform', `translate(0, ${this.height / 4})`);

      const tooltipText = tooltipGroup.append('text')
        .attr('class', 'tooltip-text')
        .attr('x', 0)
        .attr('y', 0)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '12px')
        .attr('fill', '#000000')
        .text(this.tooltip)
        .style('opacity', 0);

      const textBBox = tooltipText.node().getBBox();
      const padding = 10;

      const tooltipRect = tooltipGroup.append('rect')
        .attr('class', 'tooltip-background')
        .attr('x', textBBox.x - padding)
        .attr('y', textBBox.y - padding)
        .attr('width', textBBox.width + 2 * padding)
        .attr('height', textBBox.height + 2 * padding)
        .attr('fill', 'white')
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .attr('rx', 5)
        .attr('ry', 5)
        .style('opacity', 0);

      tooltipText.raise();

      this.tooltipElement = tooltipGroup.append('text')
        .attr('class', 'tooltip-text')
        .attr('x', 0)
        .attr('y', 0)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '12px')
        .attr('fill', '#000000')
        .text(this.tooltip)
        .style('opacity', 0);

      this.chart.on('mouseover', () => {
        tooltipRect.transition().duration(200).style('opacity', 1);
        this.tooltipElement.transition().duration(200).style('opacity', 1);
      });

      this.chart.on('mouseout', () => {
        tooltipRect.transition().duration(200).style('opacity', 0);
        this.tooltipElement.transition().duration(200).style('opacity', 0);
      });
    }
  }

  render() {
    return <div class="gauge-chart" style={{ width: `${this.width}px`, height: `${this.height}px` }}></div>;
  }
}