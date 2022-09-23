import { Argv } from 'yargs';
import { ApplyHookFunction, ConfigurationHooks } from './configuration-hooks';

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
  nodePaths: string;
  ownPath: string;
  ownNodeModules: string;
}

export interface DazzleConfig extends ConfigurationHooks {
  options?: Partial<DazzleOptions>;
  plugins: DazzlePlugin[];
}

export type ConfigHook<T> = (config: T) => T | Promise<T>;

export interface DazzleContext extends ConfigurationHooks {
  name: string;
  dazzleOptions: DazzleOptions;
  plugins: DazzlePlugin[];
  pluginOptions: DazzlePluginOptions;
  paths: DazzlePaths;
  applyHook: ApplyHookFunction;
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
