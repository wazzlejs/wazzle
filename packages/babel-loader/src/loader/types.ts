import webpack from 'webpack';

export interface WazzleWebpack5LoaderOptions {
  dazzleBuildName?: string;
  browserslistEnv?: string;
  hasJsxRuntime?: boolean;
  hasReactRefresh?: boolean;
  isServer: boolean;
  development?: boolean;
  sourceMaps?: boolean | 'inline' | 'both' | null | undefined;
  overrides: any;
  caller?: any;
  configFile?: string;
  cwd: string;
  cache: boolean;
  hasModern: boolean;
  babelPresetPlugins: unknown[];
}

export interface WazzleWebpack5LoaderDefinitionFunction
  extends webpack.LoaderDefinitionFunction<
    WazzleWebpack5LoaderOptions,
    {
      target: string | [string, string];
    }
  > {}

export type WazzleWebpack5LoaderContext = ThisParameterType<WazzleWebpack5LoaderDefinitionFunction>;

export type SourceMap = Parameters<WazzleWebpack5LoaderContext['callback']>[2];
export type Source = Parameters<WazzleWebpack5LoaderContext['callback']>[1];
