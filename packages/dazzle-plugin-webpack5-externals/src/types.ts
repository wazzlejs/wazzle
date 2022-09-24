import '@elzzad/dazzle-plugin-webpack5';
import { DazzlePluginOptions } from '@elzzad/dazzle';

declare module '@elzzad/dazzle/types' {
  export interface DazzlePluginOptions {
    webpack5Externals: Readonly<Webpack5ExternalsPluginOptions>;
  }
}

export interface Webpack5ExternalsPluginOptions {
  esmExternals: boolean | 'loose';
  notCallback?: (request: string, context: string) => boolean;
}
