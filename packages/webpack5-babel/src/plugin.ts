import { DazzlePlugin } from '@wazzle/wazzle';
import { WebpackBuildContext } from '@wazzle/webpack5';
import { DazzleContext } from '@wazzle/wazzle/types';
import Webpack, { webpack } from 'webpack';
import { DazzleContextWithPossibleBrowsersList } from '@wazzle/webpack5';

class Webpack5BabelPlugin implements DazzlePlugin {
  name = 'webpack5-babel';

  constructor() {}

  modifyWebpackContext(dazzleContext: DazzleContext, webpackContext: WebpackBuildContext) {
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
