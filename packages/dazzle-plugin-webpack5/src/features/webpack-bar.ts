import { Webpack5PluginOptions, WebpackBuildContext, WebpackConfig } from '../types';
import WebpackBar from 'webpackbar';

export function configureWebpackBarIfNecessary(
  config: WebpackConfig,
  context: WebpackBuildContext,
  options: Webpack5PluginOptions
) {
  const barDisabled = options.disableWebpackBar === true || options.disableWebpackBar === context.buildTarget;

  if (barDisabled || !context.isDev) {
    return;
  }

  config.plugins = [
    ...(config.plugins || []),
    new WebpackBar({
      color: context.isClient ? '#f56be2' : '#c065f4',
      name: context.isClient ? 'client' : 'server',
    }),
  ];
}
