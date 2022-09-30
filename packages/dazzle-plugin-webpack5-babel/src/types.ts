import { WebpackContext } from '@elzzad/dazzle-plugin-webpack5/types';
import { DazzleWebpack5LoaderOptions } from '@elzzad/dazzle-babel-loader';

export type DefinePluginDefines = {};
declare module '@elzzad/dazzle-plugin-webpack5/types' {
  interface WebpackContext {
    babelLoader: { loader: string; options: Partial<DazzleWebpack5LoaderOptions> };
  }
}
