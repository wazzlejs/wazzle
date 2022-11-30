import { Argv } from 'yargs';
import { ApplyHookFunction } from './configuration-hooks';

export type WazzleOptions = {
  verbose: boolean;
  debug: boolean;
};

export interface WazzlePluginOptions {}

export interface WazzlePaths {
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

export interface WazzleConfig extends ConfigurationHooks {
  options?: Partial<WazzleOptions>;
  plugins: WazzlePlugin[];
}

export interface ConfigurationHooks {
  modifyContext?: (context: WazzleContext) => WazzleContext;
}

export type ConfigHook<TPluginContext, TConfig> = (
  dazzleContext: Readonly<WazzleContext>,
  pluginContext: TPluginContext,
  config: TConfig
) => TConfig | Promise<TConfig>;

export type NoPluginContextConfigHook<TConfig> = (
  dazzleContext: Readonly<WazzleContext>,
  config: TConfig
) => TConfig | Promise<TConfig>;

export interface WazzleContext extends ConfigurationHooks {
  name: string;
  dazzleOptions: WazzleOptions;
  plugins: WazzlePlugin[];
  pluginOptions: WazzlePluginOptions;
  paths: WazzlePaths;
  applyHook: ApplyHookFunction;
}

export interface WazzleEnvironment {
  NODE_ENV: string;
  PORT: number;
  VERBOSE: boolean;
  HOST: string;
  ASSETS_MANIFEST: string;
  BUILD_TARGET: string;
}

export interface CommandAdder {
  (argv: Argv, dazzleContext: WazzleContext): void;
}

export interface ProvidesCommands {
  addCommands: CommandAdder;
}

export interface WazzlePlugin extends ConfigurationHooks {
  readonly name: string;
  addCommands?: CommandAdder;
}


export type DynamicImport<T> = (url: string) => Promise<{ default: T }>;
export type PotentialPromise<T> = T | Promise<T>;