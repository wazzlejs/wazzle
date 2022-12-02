import {
  logger,
  WazzlePlugin,
  WazzleContext,
  ProvidesCommands,
  Hook,
  ModifyWazzleContext,
  ConfigHook,
} from '@wazzle/wazzle';
import { Webpack5PluginOptions } from './types';
import { Argv } from 'yargs';
import path from 'path';
import Webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import { createWebpackConfig } from './create-webpack-config';
import { loadOptions } from './options';

class Webpack5Plugin implements WazzlePlugin, ProvidesCommands, ModifyWazzleContext {
  readonly name = 'webpack5';

  options: Webpack5PluginOptions;

  constructor(options: Partial<Webpack5PluginOptions> = {}) {
    this.options = loadOptions(options);
  }

  modifyWazzleContext: Hook<'modifyWazzleContext'> = ({ wazzleContext }) => {
    wazzleContext.pluginOptions.webpack5 = Object.assign({}, this.options);
    const appPath = wazzleContext.paths.appPath;
    const appSrc = path.join(appPath, 'src');
    const appBuild = path.join(appPath, 'build');

    Object.assign(wazzleContext.paths, {
      appSrc: appSrc,
      appBuild: appBuild,
      appBuildPublic: path.join(appBuild, 'public'),
      appServerIndex: path.join(appSrc, 'index'),
      appServerPath: path.join(appSrc, 'server'),
      appClientPath: path.join(appSrc, 'client'),
    });

    Object.assign(wazzleContext, {
      buildMatrix: this.options.buildMatrix,
      devMatrixName: this.options.devMatrixName,
    });

    return wazzleContext;
  };

  async start(dazzleContext: WazzleContext) {
    this.ensureNodeDevelopmentEnvironment();
    const configs = await createWebpackConfig(this.options, dazzleContext, true, true);
    const compiler = Webpack(configs.configurations.map((x) => x.webpackConfig));

    if (configs.devServerConfiguration) {
      const server = new WebpackDevServer(configs.devServerConfiguration, compiler);

      const runServer = async () => {
        console.log('Starting server...');
        await server.start();
      };

      runServer().then(() => logger.done('Server finished'));
    } else {
      compiler.watch(
        {
          // Example [watchOptions](/configuration/watch/#watchoptions)
          aggregateTimeout: 300,
          poll: undefined,
        },
        (err, stats) => {
          // [Stats Object](#stats-object)
          // Print watch/build result here...
          console.log(stats);
        }
      );
    }
  }

  async build(dazzleContext: WazzleContext) {
    if (typeof process.env['NODE_ENV'] === 'undefined') {
      process.env['NODE_ENV'] = 'production';
    } else if (process.env['NODE_ENV'] === 'development') {
      logger.warn('Running build with NODE_ENV=development, set NODE_ENV=production');
    }

    const configs = await createWebpackConfig(
      this.options,
      dazzleContext,
      false,
      process.env['NODE_ENV'] === 'development'
    );
    const compiler = Webpack(configs.configurations.map((x) => x.webpackConfig));
    compiler.run((err, stats) => {
      // [Stats Object](#stats-object)
      // Print watch/build result here...
      if (stats) {
        // console.log(inspect(stats.toJson("verbose"), false, 6, true));
      }
    });
  }

  addCommands(argv: Argv, dazzleContext: WazzleContext) {
    argv.command(
      'start',
      'start the webpack dev server',
      (yargs) => {
        yargs.option('u', {
          alias: 'url',
          describe: 'the URL to open',
        });
      },
      () => this.start(dazzleContext)
    );

    argv.command(
      'build',
      'build using webpack',
      function (yargs) {
        return yargs.option('u', {
          alias: 'url',
          describe: 'the URL to open',
        });
      },
      () => this.build(dazzleContext)
    );
  }

  private ensureNodeDevelopmentEnvironment() {
    if (typeof process.env['NODE_ENV'] === 'undefined') {
      process.env['NODE_ENV'] = 'development';
    } else if (process.env['NODE_ENV'] === 'production') {
      logger.warn('Cannot run devserver with NODE_ENV production, setting to development');
      process.env['NODE_ENV'] = 'development';
    }
  }
}

export function webpack5Plugin(options: Partial<Webpack5PluginOptions> = {}): Webpack5Plugin {
  return new Webpack5Plugin(options);
}
