import { DazzlePlugin } from '@elzzad/dazzle';
import { WebpackContext } from '@elzzad/dazzle-plugin-webpack5/types';
import { DazzleContext } from '@elzzad/dazzle';
import Webpack from 'webpack';

class Webpack5BabelPlugin implements DazzlePlugin {
  name = 'webpack5-babel';

  constructor() {}

  modifyWebpackContext(dazzleContext: DazzleContext, webpackContext: WebpackContext) {
    webpackContext.babelLoader = {
      loader: '@elzzad/dazzle-babel-loader',
      options: {
        dazzleBuildName: webpackContext.buildName,
        isServer: webpackContext.isServer,
        cwd: dazzleContext.paths.appPath,
        //browserslistEnv: razzleContext.browserslistEnvs[webp.buildName] && webpackOptions.buildName,
        cache: true,
        babelPresetPlugins: [],
        hasModern: false, // !!config.experimental.modern,
        development: webpackContext.isDev,
        hasReactRefresh: false,
      },
    };
    return webpackContext;
  }

  modifyWebpackConfig(
    dazzleContext: DazzleContext,
    webpackContext: WebpackContext,
    webpackConfig: Webpack.Configuration
  ) {
    webpackConfig?.module?.rules?.push(
      ...[
        {
          test: /\.[jt]sx?$/i,
          include: [dazzleContext.paths.appSrc], //.concat(additionalIncludes)
          use: [webpackContext.babelLoader],
        },
      ]
    );
    return webpackConfig;
  }
}

export function webpack5BabelPlugin(): Webpack5BabelPlugin {
  return new Webpack5BabelPlugin();
}
