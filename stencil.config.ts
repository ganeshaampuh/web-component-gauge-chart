import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'chart-gauge-stencil',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
    },
    {
      type: 'www'
    }
  ],
  testing: {
    browserHeadless: "new",
  },
};
