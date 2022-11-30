import { WazzlePlugin } from '@wazzle/wazzle';
import { WebpackBuildContext } from '@wazzle/webpack5';
import { WazzleContext } from '@wazzle/wazzle/types';
import Webpack, { webpack } from 'webpack';
import { WazzleContextWithPossibleBrowsersList } from '@wazzle/webpack5';

class Webpack5BabelPlugin implements WazzlePlugin {
  name = 'webpack5-babel';

  constructor() {}

  modifyWebpackContext(dazzleContext: WazzleContext, webpackContext: WebpackBuildContext) {
    webpackContext.babelLoader = {
      loader: '@wazzle/babel-loader',
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
    dazzleContext: WazzleContextWithPossibleBrowsersList,
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
    dazzleContext: WazzleContext,
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
