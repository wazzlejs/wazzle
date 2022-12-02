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

export interface WazzleHookContext {
  wazzleContext: WazzleContext;
}
export interface ConfigurationHooks {
  modifyWazzleContext?: ConfigHook<WazzleHookContext, WazzleContext>;
}

export interface ModifyWazzleContext {
  modifyWazzleContext: Hook<'modifyWazzleContext'>;
}

export type Hook<THook extends keyof ConfigurationHooks> = Required<ConfigurationHooks>[THook];
export type PossiblePromise<T> = T | Promise<T>;

export type PickHook<THook, TKey extends keyof THook> = Required<Pick<THook, TKey>>;
export type ConfigHook<TContext, TReturn> = (context: TContext) => PossiblePromise<TReturn>;

export interface WazzleContext extends ConfigurationHooks {
  name: string;
  wazzleOptions: WazzleOptions;
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
