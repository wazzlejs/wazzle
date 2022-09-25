import { WebpackContext } from '@elzzad/dazzle-plugin-webpack5/types';

export type DefinePluginDefines = {};
declare module '@elzzad/dazzle-plugin-webpack5/types' {
  interface WebpackContext {
    babelLoader: { loader: string; options: Record<string, unknown> };
  }
}
