import fs from 'fs';
import '@swc-node/register';
import setupEnvironment from '../env';
import { logger } from '../logger';
import defaultPaths from '../paths';
import { WazzleConfig, WazzleOptions, WazzleContext, WazzlePlugin } from '../types';
import { loadConfig } from './typescript-loader';
import { applyHook } from '../configuration-hooks';
import path from 'path/win32';

interface WazzleLoaderOptions {
  dazzleConfigIn?: WazzleConfig;
  packageJsonIn?: unknown;
  configFilePath?: string;
}

export async function loadWazzleConfig({
  dazzleConfigIn,
  packageJsonIn,
  configFilePath,
}: WazzleLoaderOptions): Promise<WazzleContext> {
  let dazzleConfig: WazzleConfig = dazzleConfigIn || { plugins: [] };
  let packageJson = packageJsonIn || {};
  /* Check for dazzle.config.ts file
  if (fs.existsSync(defaultPaths.appConfig + '.mjs')) {
    try {
      dazzleConfig = (await import(defaultPaths.appConfig + '.mjs')).default;
    } catch (e) {
      logger.error('Invalid dazzle.config.mjs file.', e);
      process.exit(1);
    }
  } else if (fs.existsSync(defaultPaths.appConfig + '.ts')) {
    */
  try {
    dazzleConfig = await loadConfig(defaultPaths.appPath, configFilePath);
  } catch (e) {
    logger.error('Invalid dazzle.config.ts file.', e);
    process.exit(1);
  }
  //}
  if (fs.existsSync(defaultPaths.appPackageJson)) {
    try {
      packageJson = JSON.parse(fs.readFileSync(defaultPaths.appPackageJson).toString());
    } catch (e) {
      logger.error('Invalid package.json.', e);
      process.exit(1);
    }
  }

  setupEnvironment(defaultPaths);

  const dazzleOptions: WazzleOptions = Object.assign({ verbose: false, debug: false }, dazzleConfig.options || {});

  const dazzleContext: WazzleContext = Object.assign(
    {
      name: 'WazzleContext',
      paths: defaultPaths,
      dazzleOptions: dazzleOptions,
      pluginOptions: {},
      applyHook: applyHook,
    },
    dazzleConfig
  );

  await dazzleContext.applyHook('modifyContext', async (plugin) => await plugin.modifyContext(dazzleContext));
  return dazzleContext;
}
