import { newSpecPage } from '@stencil/core/testing';
import { GaugeChart } from './chart-gauge';

describe('chart-gauge', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [GaugeChart],
      html: '<chart-gauge></chart-gauge>',
    });
    expect(page.root).toEqualHtml(`
      <chart-gauge>
        <mock:shadow-root>
          <div class="gauge-chart" style="width: 400px; height: 300px;"></div>
        </mock:shadow-root>
      </chart-gauge>
    `);
  });

  it('renders with custom props', async () => {
    const page = await newSpecPage({
      components: [GaugeChart],
      html: '<chart-gauge value="50" label="Temperature" units="°C"></chart-gauge>',
    });
    expect(page.root).toEqualHtml(`
      <chart-gauge value="50" label="Temperature" units="°C">
        <mock:shadow-root>
          <div class="gauge-chart" style="width: 400px; height: 300px;"></div>
        </mock:shadow-root>
      </chart-gauge>
    `);
  });

  it('updates needle and value text when value changes', async () => {
    const page = await newSpecPage({
      components: [GaugeChart],
      html: '<chart-gauge value="0"></chart-gauge>',
    });
    
    const component = page.rootInstance;
    const updateNeedleSpy = jest.spyOn(component, 'updateNeedle');
    const updateValueTextSpy = jest.spyOn(component, 'updateValueText');

    component.value = 75;
    await page.waitForChanges();

    expect(updateNeedleSpy).toHaveBeenCalledWith(75);
    expect(updateValueTextSpy).toHaveBeenCalledWith(75);
  });

  it('calculates min and max values correctly', async () => {
    const page = await newSpecPage({
      components: [GaugeChart],
      html: '<chart-gauge></chart-gauge>',
    });
    
    const component = page.rootInstance;
    component.settings = [
      { name: 'Low', from: 0, to: 30, color: 'green' },
      { name: 'Medium', from: 30, to: 70, color: 'yellow' },
      { name: 'High', from: 70, to: 100, color: 'red' }
    ];

    expect(component.minValue).toBe(0);
    expect(component.maxValue).toBe(100);
  });

  it('shows tooltip on mouseover and hides on mouseout', async () => {
    const page = await newSpecPage({
      components: [GaugeChart],
      html: '<chart-gauge tooltip="Gauge tooltip"></chart-gauge>',
    });
    
    await page.waitForChanges();
    const component = page.rootInstance;
    component.componentDidLoad();

    const chart = component.chart;
    const tooltipElement = component.tooltipElement;

    chart.dispatch('mouseover');
    await page.waitForChanges();
    expect(tooltipElement.style().opacity).toBe('1');

    chart.dispatch('mouseout');
    await page.waitForChanges();
    expect(tooltipElement.style().opacity).toBe('0');
  });
});
