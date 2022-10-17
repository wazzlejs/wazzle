import fs from 'fs';
import '@swc-node/register';
import setupEnvironment from '../env';
import { logger } from '../logger';
import defaultPaths from '../paths';
import { DazzleConfig, DazzleOptions, DazzleContext, DazzlePlugin } from '../types';
import { loadConfig } from './typescript-loader';
import { applyHook } from '../configuration-hooks';

export async function loadRazzleConfig(dazzleConfigIn?: DazzleConfig, packageJsonIn?: unknown): Promise<DazzleContext> {
  let dazzleConfig: DazzleConfig = dazzleConfigIn || { plugins: [] };
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
      dazzleConfig = await loadConfig();
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

  const dazzleOptions: DazzleOptions = Object.assign({ verbose: false, debug: false }, dazzleConfig.options || {});

  const dazzleContext: DazzleContext = Object.assign(
    {
      name: 'DazzleContext',
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
