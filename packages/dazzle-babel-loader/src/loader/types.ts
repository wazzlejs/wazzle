import webpack from 'webpack';

export interface DazzleWebpack5LoaderOptions {
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

export interface DazzleWebpack5LoaderDefinitionFunction
  extends webpack.LoaderDefinitionFunction<
    DazzleWebpack5LoaderOptions,
    {
      target: string | [string, string];
    }
  > {}

export type DazzleWebpack5LoaderContext = ThisParameterType<DazzleWebpack5LoaderDefinitionFunction>;

export type SourceMap = Parameters<DazzleWebpack5LoaderContext['callback']>[2];
export type Source = Parameters<DazzleWebpack5LoaderContext['callback']>[1];
