import { ConfigHook, NoPluginContextConfigHook } from '@wazzle/wazzle';
import Webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import { DazzleContext } from '@wazzle/wazzle/types';

export type WebpackConfig = Webpack.Configuration;
export type WebpackDevServerConfig = WebpackDevServer.Configuration;

declare module '@wazzle/wazzle/types' {
  export interface DazzlePaths {
    appSrc: string;
    appBuild: string;
    appBuildPublic: string;
    appServerIndex: string;
    appServerPath: string;
    appClientPath: string;
  }

  export interface ConfigurationHooks {
    modifyWebpackContext?: NoPluginContextConfigHook<WebpackBuildContext>;
    modifyWebpackConfig?: ConfigHook<WebpackBuildContext, WebpackConfig>;
    modifyDevServerConfig?: NoPluginContextConfigHook<WebpackDevServerConfig>;
  }

  export interface DazzleContext {
    devMatrixName: string;
    buildMatrix: Record<string, BuildConfig>;
  }

  export interface DazzlePluginOptions {
    webpack5: Readonly<Webpack5PluginOptions>;
  }
}

export interface WebpackPluginContext {
  port: number;
}

export interface WebpackBuildContext {
  matrixName: string;
  buildTargets: string[];
  buildTarget: string;
  buildOptions?: BuildOptions;
  buildName: string;
  isDev: boolean;
  isProd: boolean;
  isClient: boolean;
  isServer: boolean;
  outputEsm: boolean;
  definePluginOptions: DefinePluginDefines;
}

export type BuildOptions = Record<string, unknown>;

export interface BuildConfig {
  targets: string[];
  depends?: Record<string, string[]>;
  buildOptions?: BuildOptions;
}

export interface Webpack5PluginOptions {
  devMatrixName: string;
  buildMatrix: Record<string, BuildConfig>;
  outputEsm: boolean | { server: boolean; client: boolean };
  disableWebpackBar: boolean | string;
  devServerOptions: DevServerOptions;
}

export interface DevServerOptions {
  port: number;
  host: string;
}

export interface DefinePluginDefines {
  'process.env.NODE_ENV': string;
}

export type DazzleContextWithPossibleBrowsersList = { browserslistEnvs?: string } & DazzleContext;
