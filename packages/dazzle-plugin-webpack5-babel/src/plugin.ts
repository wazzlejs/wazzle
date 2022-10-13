import { DazzlePlugin } from '@elzzad/dazzle';
import { WebpackBuildContext } from '@elzzad/dazzle-plugin-webpack5/types';
import { DazzleContext } from '@elzzad/dazzle/types';
import Webpack, { webpack } from 'webpack';
import { DazzleContextWithPossibleBrowsersList } from '@elzzad/dazzle-plugin-webpack5';

class Webpack5BabelPlugin implements DazzlePlugin {
  name = 'webpack5-babel';

  constructor() {}

  modifyWebpackContext(dazzleContext: DazzleContext, webpackContext: WebpackBuildContext) {
    webpackContext.babelLoader = {
      loader: '@elzzad/dazzle-babel-loader',
      options: {
        dazzleBuildName: webpackContext.buildName,
        isServer: webpackContext.isServer,
        cwd: dazzleContext.paths.appPath,
        browserslistEnv: this.getBrowserslistEnv(dazzleContext, webpackContext),
        cache: true,
        babelPresetPlugins: [],
        hasModern: false,
        // !!config.experimental.modern, development : webpackContext.isDev, hasReactRefresh : false,
      },
    };
    return webpackContext;
  }

  private getBrowserslistEnv(
    dazzleContext: DazzleContextWithPossibleBrowsersList,
    webpackContext: WebpackBuildContext
  ): string | undefined {
    if (
      webpackContext.buildName &&
      dazzleContext.browserslistEnvs &&
      dazzleContext.browserslistEnvs.includes(webpackContext.buildName)
    ) {
      return webpackContext.buildName;
    } else {
      return undefined;
    }
  }

  modifyWebpackConfig(
    dazzleContext: DazzleContext,
    webpackContext: WebpackBuildContext,
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
