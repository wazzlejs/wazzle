import { WazzleConfig, PotentialPromise, DynamicImport } from '../types';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { prepare } from 'rechoir';
import { logger } from '../logger';
import interpret from 'interpret';

interface ImportLoaderError extends Error {
  code?: string;
}

interface RechoirError extends Error {
  failures: RechoirError[];
  error: Error;
}

export async function loadConfig(appPath: string, configPath?: string): Promise<WazzleConfig> {
  let loadedConfig: WazzleConfig | undefined;
  let triedConfigFiles: string[] = [];

  if (configPath) {
    let cliConfigFile = path.join(appPath, configPath);
    triedConfigFiles = [cliConfigFile];
    if (fs.existsSync(cliConfigFile)) {
      loadedConfig = await loadConfigByPath(cliConfigFile);
    }
  } else {
    // Order defines the priority, in decreasing order
    triedConfigFiles = ['wazzle.config', '.wazzle/wazzle.config', '.dazzle/dazzlefile'].map((pth) =>
      path.join(appPath, pth)
    );
    loadedConfig = await loadFirstAvailableConfig(triedConfigFiles);
  }

  if (loadedConfig === undefined) {
    logConfigLoadingErrorAndExit(triedConfigFiles);
  }
  return loadedConfig;
}

function setupCustomFileLoadersIfNecessary(configPath: string) {
  const configExtension = path.extname(configPath);
  const interpreted = Object.keys(interpret.jsVariants).find((variant) => variant === configExtension);
  if (interpreted) {
    try {
      prepare(interpret.extensions, configPath);
    } catch (error) {
      if ((error as RechoirError)?.failures) {
        logger.error(`Unable load '${configPath}'`);
        logger.error((error as RechoirError).message);
        (error as RechoirError).failures.forEach((failure) => {
          logger.error(failure.error.message);
        });
        logger.error('Please install one of them');
        process.exit(2);
      }

      logger.error(error as string);
      process.exit(2);
    }
  }
}

function isObject(value: unknown): boolean {
  return typeof value === 'object' && value !== null;
}

async function loadConfigByPath(configPath: string) {
  setupCustomFileLoadersIfNecessary(configPath);
  const config = await tryRequireThenImport(configPath);
  if (!isObject(config)) {
    logger.error(`Invalid configuration in '${configPath}'`);
    process.exit(2);
  }
  return config;
}

async function loadFirstAvailableConfig(configPaths: string[]) {
  const extensions = [...Object.keys(interpret.extensions), '.cjs'];
  const configPathsWithExtensions = configPaths.flatMap((configPath) =>
    extensions.map((extension) => `${configPath}${extension}`)
  );
  for (const configPath of configPathsWithExtensions) {
    if (fs.existsSync(configPath)) {
      return await loadConfigByPath(configPath);
    }
  }
  return undefined;
}

function logConfigLoadingErrorAndExit(triedConfigs: string[]): never {
  logger.error(
    `Configuration(s) with the name "${triedConfigs.join(', ')}" was not found.`
  );
  process.exit(2);
}

async function tryRequireThenImport(module: string): Promise<WazzleConfig> {
  let result;
  try {
    result = require(module);
    // For babel/typescript
    if (result && typeof result === 'object' && 'default' in result) {
      result = (await result.default) || {};
    }

    return result || {};
  } catch (error) {
    if (
      ((error as ImportLoaderError).code === 'ERR_REQUIRE_ESM' || process.env.DAZZLE_CLI_FORCE_LOAD_ESM_CONFIG) &&
      pathToFileURL
    ) {
      const urlForConfig = pathToFileURL(module);
      result = await import(urlForConfig.toString());
      result = result.default;
      return result;
    }

    logger.error(`Failed to load '${module}'`, error);
    process.exit(2);
  }
}

function isPromise<T>(value: Promise<T>): value is Promise<T> {
  return typeof (value as unknown as Promise<T>).then === 'function';
}

function isFunction(value: unknown): value is CallableFunction {
  return typeof value === 'function';
}
