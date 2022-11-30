import '@wazzle/webpack5';
import { WazzlePluginOptions } from '@wazzle/wazzle';

declare module '@wazzle/wazzle/types' {
  export interface WazzlePluginOptions {
    webpack5Externals: Readonly<Webpack5ExternalsPluginOptions>;
  }
}

export interface Webpack5ExternalsPluginOptions {
  esmExternals: boolean | 'loose';
  notCallback?: (request: string, context: string) => boolean;
}
