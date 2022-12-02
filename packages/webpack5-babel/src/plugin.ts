import { WazzlePlugin } from '@wazzle/wazzle';
import { WebpackBuildContext } from '@wazzle/webpack5';
import { Hook, WazzleContext } from '@wazzle/wazzle/types';
import Webpack, { webpack } from 'webpack';
import { WazzleContextWithPossibleBrowsersList } from '@wazzle/webpack5';

class Webpack5BabelPlugin implements WazzlePlugin {
  name = 'webpack5-babel';

  constructor() {}

  modifyWebpackContext: Hook<'modifyWebpackContext'> = ({ wazzleContext, webpackContext }) => {
    webpackContext.babelLoader = {
      loader: '@wazzle/babel-loader',
      options: {
        dazzleBuildName: webpackContext.buildName,
        isServer: webpackContext.isServer,
        cwd: wazzleContext.paths.appPath,
        browserslistEnv: this.getBrowserslistEnv(wazzleContext, webpackContext),
        cache: true,
        babelPresetPlugins: [],
        hasModern: false,
        // !!config.experimental.modern, development : webpackContext.isDev, hasReactRefresh : false,
      },
    };
    return webpackContext;
  };

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

  modifyWebpackConfig: Hook<'modifyWebpackConfig'> = ({ wazzleContext, webpackContext, webpackConfig }) => {
    webpackConfig?.module?.rules?.push(
      ...[
        {
          test: /\.[jt]sx?$/i,
          include: [wazzleContext.paths.appSrc], //.concat(additionalIncludes)
          use: [webpackContext.babelLoader],
        },
      ]
    );
    return webpackConfig;
  };
}

export function webpack5BabelPlugin(): Webpack5BabelPlugin {
  return new Webpack5BabelPlugin();
}
