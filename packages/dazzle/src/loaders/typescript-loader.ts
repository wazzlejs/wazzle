import { DazzleConfig, PotentialPromise, DynamicImport } from '../types';
import path from 'path';
import { pathToFileURL } from 'url';
import { prepare } from 'rechoir';
import { logger } from '../logger';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

let argv = yargs().scriptName('dazzle').option('c', {
  type: 'string',
  alias: 'config',
  describe: 'load config file',
}).parse(hideBin(process.argv), {}, function () {});

interface ImportLoaderError extends Error {
  code?: string;
}
interface Rechoir {
  prepare: typeof prepare;
}

interface RechoirError extends Error {
  failures: RechoirError[];
  error: Error;
}

async function loadConfig() {
  const interpret = require('interpret');
  const loadConfigByPath = async (configPath: string) => {
    const ext = path.extname(configPath);
    const interpreted = Object.keys(interpret.jsVariants).find((variant) => variant === ext);

    if (interpreted) {
      const rechoir: Rechoir = require('rechoir');

      try {
        rechoir.prepare(interpret.extensions, configPath);
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

        logger.error(error);
        process.exit(2);
      }
    }

    let config: DazzleConfig;

    type CouldBeConfigPromise = PotentialPromise<DazzleConfig>;

    try {
      config = await tryRequireThenImport<CouldBeConfigPromise>(configPath, false);
      // @ts-expect-error error type assertion
    } catch (error: Error) {
      logger.error(`Failed to load '${configPath}' config`);

      logger.error(error);

      process.exit(2);
    }

      if (isPromise<ConfigOptions>(config as Promise<DazzleConfig>)) {
        config = await config;
      }

      // `Promise` may return `Function`
      if (isFunction(config)) {
        // when config is a function, pass the env from args to the config function
        config = await config(argv.env, argv);
      }
    }

    const isObject = (value: unknown): value is object => typeof value === 'object' && value !== null;

    if (!isObject(config)) {
      logger.error(`Invalid configuration in '${configPath}'`);

      process.exit(2);
      )

    return { config, path: configPath };
  };

  let loadedConfig: DazzleConfig | null = null;
  let triedConfigfiles: string[];


  if (argv.config) {
    let cliConfigFile = path.resolve(argv.config);
    triedConfigfiles.push(cliConfigFile)
    if (!fs.existsSync(cliConfigFile)) {
      loadedConfig = await loadConfigByPath(cliConfigFile);
    }
  }
  else {
    // Order defines the priority, in decreasing order
    const defaultConfigFiles = ['dazzle.config', '.dazzle/dazzle.config', '.dazzle/dazzlefile']
      .map((filename) =>
        // Since .cjs is not available on interpret side add it manually to default config extension list
        [...Object.keys(interpret.extensions), '.cjs'].map((ext) => ({
          path: path.resolve(filename + ext),
          ext: ext,
          module: interpret.extensions[ext],
        }))
      )
      .reduce((accumulator, currentValue) => accumulator.concat(currentValue), []);

    let foundDefaultConfigFile;

    for (const defaultConfigFile of defaultConfigFiles) {
      triedConfigfiles.push(defaultConfigFile.path)
      
      if (!fs.existsSync(defaultConfigFile.path)) {
        continue;
      }

      foundDefaultConfigFile = defaultConfigFile;
      break;
    }

    if (foundDefaultConfigFile) {
      const loadedConfig = await loadConfigByPath(foundDefaultConfigFile.path, options.argv);
    }
  }

    if (loadedConfig == null) {
      logger.error(
        triedConfigfiles.map((configName) => `Configuration with the name "${configName}" was not found.`).join(' ')
      );
      process.exit(2);
    }
  return loadedConfig;
}

async function tryRequireThenImport<T>(module: ModuleName, handleError = true): Promise<T> {
  let result;

  try {
    result = require(module);
  } catch (error) {
    const dynamicImportLoader: null | DynamicImport<T> = require('./dynamic-import-loader')();
    if (
      ((error as ImportLoaderError).code === 'ERR_REQUIRE_ESM' || process.env.DAZZLE_CLI_FORCE_LOAD_ESM_CONFIG) &&
      pathToFileURL &&
      dynamicImportLoader
    ) {
      const urlForConfig = pathToFileURL(module);

      result = await dynamicImportLoader(urlForConfig);
      result = result.default;

      return result;
    }

    if (handleError) {
      logger.error(error);
      process.exit(2);
    } else {
      throw error;
    }
  }

  // For babel/typescript
  if (result && typeof result === 'object' && 'default' in result) {
    result = result.default || {};
  }

  return result || {};
}

function isPromise<T>(value: Promise<T>): value is Promise<T> {
  return typeof (value as unknown as Promise<T>).then === 'function';
}
function isFunction(value: unknown): value is CallableFunction {
  return typeof value === 'function';
}
