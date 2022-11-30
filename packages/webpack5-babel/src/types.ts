import { DazzleWebpack5LoaderOptions } from '@wazzle/babel-loader';

export type DefinePluginDefines = {};

declare module '@wazzle/webpack5/types' {
  interface WebpackBuildContext {
    babelLoader: { loader: string; options: Partial<DazzleWebpack5LoaderOptions> };
  }
}
