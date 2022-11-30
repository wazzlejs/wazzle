import { Webpack5PluginOptions } from './types';
import merge from 'deepmerge';

export function loadOptions(options: Partial<Webpack5PluginOptions>): Webpack5PluginOptions {
  const initialOptions: Webpack5PluginOptions = {
    devMatrixName: 'default',
    disableWebpackBar: false,
    buildMatrix: {
      default: {
        targets: ['client', 'serverWeb'],
        depends: { serverWeb: ['client'] },
      },
    },

    outputEsm: false,
    devServerOptions: {
      port: 3000,
      host: 'localhost',
    },
  };

  
  return merge(initialOptions, options);
}
