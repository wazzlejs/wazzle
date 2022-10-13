import path from 'path';

import buildResolver from 'esm-resolve';
import Webpack, { Configuration } from 'webpack';
import { Configuration as DevServerConfiguration } from 'webpack-dev-server';
import { logger, DazzleContext, applyHook } from '@elzzad/dazzle';

import { Webpack5PluginOptions, WebpackBuildContext } from './types';
import { devNull, type } from 'os';
import { createDevServerConfigurationIfNecessary } from './features/dev-server';

function resolveRequest(req: string, issuer: string) {
  const basedir = issuer.endsWith(path.posix.sep) || issuer.endsWith(path.win32.sep) ? issuer : path.dirname(issuer);
  const resolve = buildResolver(basedir);
  return resolve(req);
}

interface WebpackConfigurationWithContext {
  webpackConfig: Webpack.Configuration;
  webpackContext: WebpackBuildContext;
}

export async function createWebpackConfig(
  pluginOptions: Webpack5PluginOptions,
  dazzleContext: DazzleContext,
  devServerEnabled: boolean = false,
  isDev: boolean = false
): Promise<{
  configurations: WebpackConfigurationWithContext[];
  devServerConfiguration?: DevServerConfiguration;
}> {
  const devMatrixName = dazzleContext.devMatrixName;
  const webpackConfigs: WebpackConfigurationWithContext[] = [];

  const matrixNames = isDev ? [devMatrixName] : Object.keys(dazzleContext.buildMatrix);

  for (const matrixName of matrixNames) {
    const buildConfig = dazzleContext.buildMatrix[matrixName];
    const allTargets = buildConfig.targets;

    for (const buildTarget of allTargets) {
      const isServer = /server/.test(buildTarget);
      let webpackContext: WebpackBuildContext = {
        matrixName: matrixName,
        buildTarget: buildTarget,
        buildTargets: allTargets,
        buildOptions: buildConfig.buildOptions,
        buildName: `${matrixName}-${buildTarget}`,
        isDev: isDev,
        isProd: !isDev,
        isClient: !isServer,
        isServer: isServer,
        outputEsm:
          typeof pluginOptions.outputEsm == 'boolean'
            ? pluginOptions.outputEsm
            : isServer
            ? pluginOptions.outputEsm.server
            : pluginOptions.outputEsm.client,
        definePluginOptions: { 'process.env.NODE_ENV': 'development' },
      };

      await dazzleContext.applyHook('modifyWebpackContext', async (plugin) => {
        webpackContext = await plugin.modifyWebpackContext(dazzleContext, webpackContext);
      });

      let webpackConfig: Configuration = {
        name: webpackContext.buildName,
        target: isServer ? 'node' : webpackContext.outputEsm ? ['web', 'es2015'] : 'web',
        // Path to your entry point. From this file Webpack will begin its work
        entry: isServer
          ? webpackContext.isDev
            ? dazzleContext.paths.appServerIndex
            : dazzleContext.paths.appServerPath
          : dazzleContext.paths.appClientPath,

        resolve: {
          extensions: ['.mjs', '.js', '.jsx', '.json', '.ts', '.tsx'],
        },
        // Path and filename of your result bundle.
        // Webpack will bundle all JavaScript into this file
        output: {
          path: isServer ? dazzleContext.paths.appBuild : dazzleContext.paths.appBuildPublic,
          publicPath: '',
          filename: isServer ? 'server.cjs' : 'client.js',
          module: webpackContext.outputEsm,
          chunkFormat: webpackContext.outputEsm ? 'module' : 'commonjs',
          environment: {
            module: webpackContext.outputEsm,
            dynamicImport: webpackContext.outputEsm,
          },
        },

        experiments: {
          outputModule: webpackContext.outputEsm,
        },
        // Default mode for Webpack is production.
        // Depending on mode Webpack will apply different things
        // on the final bundle.
        mode: isDev ? 'development' : 'production',
        module: {
          rules: [],
        },
      };

      if (buildConfig.depends) {
        if (buildConfig.depends[buildTarget]) {
          const depends = buildConfig.depends[buildTarget].map((dep) => (/-/.test(dep) ? dep : `${matrixName}-${dep}`));
          console.log(depends);
          webpackConfig.dependencies = depends;
        }
      }
      await dazzleContext.applyHook('modifyWebpackConfig', async (plugin) => {
        webpackConfig = await plugin.modifyWebpackConfig(dazzleContext, webpackContext, webpackConfig);
      });
      webpackConfigs.push({ webpackConfig, webpackContext });
    }
  }

  const devServerConfiguration = await createDevServerConfigurationIfNecessary(dazzleContext);

  return {
    configurations: webpackConfigs,
    devServerConfiguration,
  };
}
