import { Argv } from 'yargs';
import { ApplyHookFunction } from './configuration-hooks';

export type DazzleOptions = {
  verbose: boolean;
  debug: boolean;
};

export interface DazzlePluginOptions {}

export interface DazzlePaths {
  dotenv: string;
  appPath: string;
  appNodeModules: string;
  appPackageJson: string;
  appConfig: string;
  appPublic: string;
  nodePaths: string;
  ownPath: string;
  ownNodeModules: string;
}

export interface DazzleConfig extends ConfigurationHooks {
  options?: Partial<DazzleOptions>;
  plugins: DazzlePlugin[];
}

export interface ConfigurationHooks {
  modifyContext?: (context: DazzleContext) => DazzleContext;
}

export type ConfigHook<TPluginContext, TConfig> = (
  dazzleContext: Readonly<DazzleContext>,
  pluginContext: TPluginContext,
  config: TConfig
) => TConfig | Promise<TConfig>;

export type NoPluginContextConfigHook<TConfig> = (
  dazzleContext: Readonly<DazzleContext>,
  config: TConfig
) => TConfig | Promise<TConfig>;

export interface DazzleContext extends ConfigurationHooks {
  name: string;
  dazzleOptions: DazzleOptions;
  plugins: DazzlePlugin[];
  pluginOptions: DazzlePluginOptions;
  paths: DazzlePaths;
  applyHook: ApplyHookFunction;
}

export interface DazzleEnvironment {
  NODE_ENV: string;
  PORT: number;
  VERBOSE: boolean;
  HOST: string;
  ASSETS_MANIFEST: string;
  BUILD_TARGET: string;
}

export interface CommandAdder {
  (argv: Argv, dazzleContext: DazzleContext): void;
}

export interface ProvidesCommands {
  addCommands: CommandAdder;
}

export interface DazzlePlugin extends ConfigurationHooks {
  readonly name: string;
  addCommands?: CommandAdder;
}


export type DynamicImport<T> = (url: string) => Promise<{ default: T }>;
export type PotentialPromise<T> = T | Promise<T>;