import { Webpack5PluginOptions, WebpackBuildContext, WebpackConfig } from '../types';
import WebpackBar from 'webpackbar';

export function configureWebpackBarIfNecessary(
  config: WebpackConfig,
  context: WebpackBuildContext,
  options: Webpack5PluginOptions
) {
  if (options.disableWebpackBar || !context.isDev) {
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
