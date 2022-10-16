import { DazzleConfig, PotentialPromise, DynamicImport } from '../types';
import path from 'path';
import { pathToFileURL } from 'url';
import { prepare } from 'rechoir';
import { logger } from '../logger';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

let argv = yargs(hideBin(process.argv)).scriptName('dazzle').option('c', {
  type: 'string',
  alias: 'config',
  describe: 'load config file',
});

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
  const loadConfigByPath = async (configPath: string, argv: Argv = {}) => {
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

      if (isPromise<ConfigOptions>(options as Promise<DazzleConfig>)) {
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
    }

    return { config, path: configPath };
  };

  const config: DazzleCLIConfig = {
    options: {} as DazzleConfig,
    path: new WeakMap(),
  };

  if (options.config && options.config.length > 0) {
    const loadedConfigs = await Promise.all(
      options.config.map((configPath: string) => loadConfigByPath(path.resolve(configPath), options.argv))
    );

    config.options = [];

    loadedConfigs.forEach((loadedConfig) => {
      const isArray = Array.isArray(loadedConfig.options);

      // TODO we should run webpack multiple times when the `--config` options have multiple values with `--merge`, need to solve for the next major release
      if ((config.options as ConfigOptions[]).length === 0) {
        config.options = loadedConfig.options as DazzleConfig;
      } else {
        if (!Array.isArray(config.options)) {
          config.options = [config.options];
        }

        if (isArray) {
          (loadedConfig.options as ConfigOptions[]).forEach((item) => {
            (config.options as ConfigOptions[]).push(item);
          });
        } else {
          config.options.push(loadedConfig.options as DazzleConfig);
        }
      }

      if (isArray) {
        (loadedConfig.options as ConfigOptions[]).forEach((options) => {
          config.path.set(options, loadedConfig.path);
        });
      } else {
        config.path.set(loadedConfig.options, loadedConfig.path);
      }
    });

    config.options = config.options.length === 1 ? config.options[0] : config.options;
  } else {
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
      if (!fs.existsSync(defaultConfigFile.path)) {
        continue;
      }

      foundDefaultConfigFile = defaultConfigFile;
      break;
    }

    if (foundDefaultConfigFile) {
      const loadedConfig = await loadConfigByPath(foundDefaultConfigFile.path, options.argv);

      config.options = loadedConfig.options as DazzleConfig[];

      if (Array.isArray(config.options)) {
        config.options.forEach((item) => {
          config.path.set(item, loadedConfig.path);
        });
      } else {
        config.path.set(loadedConfig.options, loadedConfig.path);
      }
    }
  }

  if (options.configName) {
    const notFoundConfigNames: string[] = [];

    config.options = options.configName.map((configName: string) => {
      let found;

      if (Array.isArray(config.options)) {
        found = config.options.find((options) => options.name === configName);
      } else {
        found = config.options.name === configName ? config.options : undefined;
      }

      if (!found) {
        notFoundConfigNames.push(configName);
      }

      return found;
    }) as DazzleConfig[];

    if (notFoundConfigNames.length > 0) {
      logger.error(
        notFoundConfigNames.map((configName) => `Configuration with the name "${configName}" was not found.`).join(' ')
      );
      process.exit(2);
    }
  }

  return config;
}

async function tryRequireThenImport<T>(module: ModuleName, handleError = true): Promise<T> {
  let result;

  try {
    result = require(module);
  } catch (error) {
    const dynamicImportLoader: null | DynamicImport<T> = require('./dynamic-import-loader')();
    if (
      ((error as ImportLoaderError).code === 'ERR_REQUIRE_ESM' || process.env.WEBPACK_CLI_FORCE_LOAD_ESM_CONFIG) &&
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
