import path from 'path';

import buildResolver from 'esm-resolve';
import Webpack, { Configuration } from 'webpack';
import { Configuration as DevServerConfiguration } from 'webpack-dev-server';
import { logger, DazzleContext, applyHook } from '@elzzad/dazzle';

import { Webpack5PluginOptions, WebpackContext } from './types';
import { devNull, type } from 'os';

function resolveRequest(req: string, issuer: string) {
  const basedir = issuer.endsWith(path.posix.sep) || issuer.endsWith(path.win32.sep) ? issuer : path.dirname(issuer);
  const resolve = buildResolver(basedir);
  return resolve(req);
}

interface WebpackConfigurationWithContext {
  webpackConfig: Webpack.Configuration;
  webpackContext: WebpackContext;
}

export async function createWebpackConfig(
  pluginOptions: Webpack5PluginOptions,
  dazzleContext: DazzleContext,
  isDevServer: boolean = false,
  isDevEnv: boolean = false,
  isDev: boolean = false
): Promise<{
  configurations: WebpackConfigurationWithContext[];
  devServerConfiguration?: DevServerConfiguration;
}> {
  const devMatrixName = dazzleContext.devMatrixName;
  let shouldUseDevserver = isDevServer;
  const webpackConfigs: WebpackConfigurationWithContext[] = [];

  const matrixNames = isDevEnv ? [devMatrixName] : Object.keys(dazzleContext.buildMatrix);

  for (const matrixName of matrixNames) {
    const buildConfig = dazzleContext.buildMatrix[matrixName];
    const allTargets = buildConfig.targets;

    const clientOnly =
      allTargets.some((build) => /client/.test(build)) && !allTargets.some((build) => /server/.test(build));
    const serverOnly =
      !allTargets.some((build) => /client/.test(build)) && allTargets.some((build) => /server/.test(build));

    shouldUseDevserver = shouldUseDevserver && !serverOnly;

    for (const buildTarget of allTargets) {
      const isServer = /server/.test(buildTarget);
      let webpackContext: WebpackContext = {
        matrixName: matrixName,
        buildTarget: buildTarget,
        buildTargets: allTargets,
        buildOptions: buildConfig.buildOptions,
        buildName: `${matrixName}-${buildTarget}`,
        isDevEnv: isDevEnv,
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
          ? webpackContext.isDevEnv
            ? dazzleContext.paths.appServerIndex
            : dazzleContext.paths.appServerPath
          : dazzleContext.paths.appClientPath,

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
        mode: isDevEnv ? 'development' : 'production',
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

  if (shouldUseDevserver) {
    let devServerConfiguration: DevServerConfiguration = {
      static: {
        directory: path.join(dazzleContext.paths.appPath, 'public'),
      },
      compress: true,
      client: {
        logging: 'info',
      },
      port: 9000,
    };

    await dazzleContext.applyHook('modifyDevServerConfig', async (plugin) => {
      devServerConfiguration = await plugin.modifyDevServerConfig(dazzleContext, devServerConfiguration);
    });

    return {
      configurations: webpackConfigs,
      devServerConfiguration: devServerConfiguration,
    };
  }
  return {
    configurations: webpackConfigs,
  };
}
