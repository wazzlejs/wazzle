import { WazzleContext } from '@wazzle/wazzle';
import { Configuration as DevServerConfiguration } from 'webpack-dev-server';
import { Webpack5PluginOptions, WebpackDevServerConfig } from '../types';

export async function createDevServerConfigurationIfNecessary(
  wazzleContext: WazzleContext,
  { devServerOptions: options }: Webpack5PluginOptions
): Promise<WebpackDevServerConfig | undefined> {
  const hasClientBuild = Object.values(wazzleContext.buildMatrix)
    .flatMap((x) => x.targets)
    .some((target) => /client/.test(target));
  if (!hasClientBuild) {
    return undefined;
  }

  let devServerConfig: DevServerConfiguration = {
    static: {
      directory: wazzleContext.paths.appPublic,
    },
    compress: true,
    client: {
      logging: 'info',
    },
    port: options.port,
    host: options.host,
  };

  await wazzleContext.applyHook('modifyDevServerConfig', async (plugin) => {
    devServerConfig = await plugin.modifyDevServerConfig({ wazzleContext, devServerConfig });
  });
  return devServerConfig;
}
