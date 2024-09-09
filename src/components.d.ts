/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
export namespace Components {
    interface ChartGauge {
        "height": number;
        "label": string;
        "lineColor": string;
        "needleColor": string;
        "pivotColor": string;
        "settings": Array<{ name: string; from: number; to: number; color: string }>;
        "tickColor": string;
        "tickInterval": number;
        "units": string;
        "value": number;
        "width": number;
    }
}
declare global {
    interface HTMLChartGaugeElement extends Components.ChartGauge, HTMLStencilElement {
    }
    var HTMLChartGaugeElement: {
        prototype: HTMLChartGaugeElement;
        new (): HTMLChartGaugeElement;
    };
    interface HTMLElementTagNameMap {
        "chart-gauge": HTMLChartGaugeElement;
    }
}
declare namespace LocalJSX {
    interface ChartGauge {
        "height"?: number;
        "label"?: string;
        "lineColor"?: string;
        "needleColor"?: string;
        "pivotColor"?: string;
        "settings"?: Array<{ name: string; from: number; to: number; color: string }>;
        "tickColor"?: string;
        "tickInterval"?: number;
        "units"?: string;
        "value"?: number;
        "width"?: number;
    }
    interface IntrinsicElements {
        "chart-gauge": ChartGauge;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "chart-gauge": LocalJSX.ChartGauge & JSXBase.HTMLAttributes<HTMLChartGaugeElement>;
        }
    }
}
