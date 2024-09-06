# Web Component Gauge Chart

A customizable gauge chart web component built with Stencil.js and D3.js.


## Usage

To use the web component in your HTML file, add the following script tag:

```html
<script type="module" src="https://unpkg.com/web-component-gauge-chart@latest/dist/chart-gauge-stencil/chart-gauge-stencil.esm.js"></script>
```

Then, you can use the web component in your HTML file:

```html
    <chart-gauge
        width="300"
        value="35"
        label="Hours"
        min="0"
        max="80"
        distance="10">
    </chart-gauge>  

    <script>
        document.querySelector('chart-gauge').settings = [
            {
                "name": "green",
                "from": 0,
                "to": 40,
                "color": "#54bc3a"
            },
            {
                "name": "yellow",
                "from": 40,
                "to": 50,
                "color": "#dcdf0f"
            },
            {
                "name": "red",
                "from": 50,
                "to": 80,
                "color": "#de5354"
            }
        ];
    </script>
```


## Customization

You can customize the appearance of the gauge chart by passing the following properties:

- `width`: The width of the gauge chart.
- `value`: The value of the gauge chart.
- `label`: The label of the gauge chart.
- `min`: The minimum value of the gauge chart.
- `max`: The maximum value of the gauge chart.
- `distance`: The distance between the gauge chart and the label.
- `settings`: An array of objects defining the color ranges for the gauge chart. Each object should have the following properties:
  - `name`: A descriptive name for the range (optional).
  - `from`: The starting value of the range.
  - `to`: The ending value of the range.
  - `color`: The color to be used for this range (in hexadecimal format).


## License

This project is licensed under the MIT License. See the LICENSE file for more details.
