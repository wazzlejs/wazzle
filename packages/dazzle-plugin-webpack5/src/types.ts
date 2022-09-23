import { ConfigHook } from '@elzzad/dazzle';
import Webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';

declare module '@elzzad/dazzle' {
  export interface DazzlePaths {
    appSrc: string;
    appBuild: string;
    appBuildPublic: string;
    appServerIndex: string;
    appServerPath: string;
    appClientPath: string;
  }

  export interface ConfigurationHooks {
    modifyWebpackOptions?: ConfigHook<WebpackOptions & DefineOptions>;
    modifyWebpackConfig?: ConfigHook<Webpack.Configuration>;
    modifyDevServerConfig?: ConfigHook<WebpackDevServer.Configuration>;
  }

  export interface DazzleContext {
    devMatrixName: string;
    buildMatrix: Record<string, BuildConfig>;
  }

  export interface DazzlePluginOptions {
    webpack5: Readonly<Webpack5PluginOptions>;
  }
}

export interface WebpackOptions {
  matrixName: string;
  buildTargets: string[];
  buildTarget: string;
  buildOptions?: BuildOptions;
  buildName: string;
  isDevEnv: boolean;
  isDev: boolean;
  isProd: boolean;
  isClient: boolean;
  isServer: boolean;
  outputEsm: boolean;
}

export type BuildOptions = Record<string, unknown>;

export interface BuildConfig {
  targets: string[];
  depends?: Record<string, string[] | string>;
  buildOptions?: BuildOptions;
}

export interface Webpack5PluginOptions {
  devMatrixName: string;
  buildMatrix: Record<string, BuildConfig>;
  outputEsm: boolean | { server: boolean; client: boolean };
}

export interface DefinePluginDefines {
  'process.env.NODE_ENV': string;
}

export interface DefineOptions {
  definePluginOptions: DefinePluginDefines;
}
