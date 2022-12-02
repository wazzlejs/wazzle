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
  wazzleConfigIn?: WazzleConfig;
  packageJsonIn?: unknown;
  configFilePath?: string;
}

export async function loadWazzleConfig({
  wazzleConfigIn,
  packageJsonIn,
  configFilePath,
}: WazzleLoaderOptions): Promise<WazzleContext> {
  let wazzleConfig: WazzleConfig = wazzleConfigIn || { plugins: [] };
  let packageJson = packageJsonIn || {};
  /* Check for wazzle.config.ts file
  if (fs.existsSync(defaultPaths.appConfig + '.mjs')) {
    try {
      wazzleConfig = (await import(defaultPaths.appConfig + '.mjs')).default;
    } catch (e) {
      logger.error('Invalid wazzle.config.mjs file.', e);
      process.exit(1);
    }
  } else if (fs.existsSync(defaultPaths.appConfig + '.ts')) {
    */
  try {
    wazzleConfig = await loadConfig(defaultPaths.appPath, configFilePath);
  } catch (e) {
    logger.error('Invalid wazzle.config.ts file.', e);
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

  const wazzleOptions: WazzleOptions = Object.assign({ verbose: false, debug: false }, wazzleConfig.options || {});

  const wazzleContext: WazzleContext = Object.assign(
    {
      name: 'WazzleContext',
      paths: defaultPaths,
      wazzleOptions: wazzleOptions,
      pluginOptions: {},
      applyHook: applyHook,
    },
    wazzleConfig
  );

  await wazzleContext.applyHook(
    'modifyWazzleContext',
    async (plugin) => await plugin.modifyWazzleContext({ wazzleContext })
  );
  return wazzleContext;
}
