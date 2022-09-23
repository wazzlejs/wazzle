import path from 'path';

import buildResolver from 'esm-resolve';
import { Configuration } from 'webpack';
import { Configuration as DevServerConfiguration } from 'webpack-dev-server';
import { logger, DazzleContext, applyHook } from '@elzzad/dazzle';

import { DefineOptions, Webpack5PluginOptions, WebpackOptions } from './types';
import { devNull, type } from 'os';

function resolveRequest(req: string, issuer: string) {
  const basedir = issuer.endsWith(path.posix.sep) || issuer.endsWith(path.win32.sep) ? issuer : path.dirname(issuer);
  const resolve = buildResolver(basedir);
  return resolve(req);
}

export async function createWebpackConfig(
  pluginOptions: Webpack5PluginOptions,
  dazzleContext: DazzleContext,
  isDevServer: boolean = false,
  isDevEnv: boolean = false,
  isDev: boolean = false
): Promise<{
  configurations: Array<[Configuration, WebpackOptions]>;
  devServerConfiguration?: DevServerConfiguration;
}> {
  const devMatrixName = dazzleContext.devMatrixName;
  let shouldUseDevserver = isDevServer;
  const webpackConfigs: Array<[Configuration, WebpackOptions]> = [];

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
      let webpackOptions: WebpackOptions & DefineOptions = {
        matrixName: devMatrixName,
        buildTarget: buildTarget,
        buildTargets: allTargets,
        buildOptions: buildConfig.buildOptions,
        buildName: `${devMatrixName}-${buildTarget}`,
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

      dazzleContext.applyHook('modifyWebpackOptions', async (plugin) => {
        webpackOptions = await plugin.modifyWebpackOptions(webpackOptions);
      });

      let webpackConfig: Configuration = {
        name: webpackOptions.buildName,
        target: isServer ? 'node' : webpackOptions.outputEsm ? ['web', 'es2015'] : 'web',
        // Path to your entry point. From this file Webpack will begin its work
        entry: isServer
          ? webpackOptions.isDevEnv
            ? dazzleContext.paths.appServerIndex
            : dazzleContext.paths.appServerPath
          : dazzleContext.paths.appClientPath,

        // Path and filename of your result bundle.
        // Webpack will bundle all JavaScript into this file
        output: {
          path: isServer ? dazzleContext.paths.appBuild : dazzleContext.paths.appBuildPublic,
          publicPath: '',
          filename: isServer ? 'server.cjs' : 'client.js',
          module: webpackOptions.outputEsm,
          chunkFormat: webpackOptions.outputEsm ? 'module' : 'commonjs',
          environment: {
            module: webpackOptions.outputEsm,
            dynamicImport: webpackOptions.outputEsm,
          },
        },

        experiments: {
          outputModule: webpackOptions.outputEsm,
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
        console.log(buildConfig.depends);
        console.log(buildConfig.depends[buildTarget]);
        if (buildConfig.depends[buildTarget]) {
          const depends = (<Array<string>>[
            typeof buildConfig.depends[buildTarget] === 'string'
              ? [buildConfig.depends[buildTarget]]
              : buildConfig.depends[buildTarget],
          ]).map((dep) => (/-/.test(dep) ? dep : `${matrixName}-${dep}`));
          console.log(depends);
          webpackConfig.dependencies = depends;
        }
      }
      dazzleContext.applyHook('modifyWebpackConfig', async (plugin) => {
        webpackConfig = await plugin.modifyWebpackConfig(webpackConfig);
      });
      webpackConfigs.push([webpackConfig, webpackOptions]);
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

    dazzleContext.applyHook('modifyDevServerConfig', async (plugin) => {
      devServerConfiguration = await plugin.modifyDevServerConfig(devServerConfiguration);
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
