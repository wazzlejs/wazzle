import { DazzleContext } from '@elzzad/dazzle';
import { Configuration as DevServerConfiguration } from 'webpack-dev-server';
import { WebpackDevServerConfig } from '../types';

export async function createDevServerConfigurationIfNecessary(
  dazzle: DazzleContext
): Promise<WebpackDevServerConfig | undefined> {
  const hasClientBuild = Object.values(dazzle.buildMatrix)
    .flatMap((x) => x.targets)
    .some((target) => /client/.test(target));
  if (!hasClientBuild) {
    return undefined;
  }

  let devServerConfiguration: DevServerConfiguration = {
    static: {
      directory: dazzle.paths.appPublic,
    },
    compress: true,
    client: {
      logging: 'info',
    },
    port: 9000,
  };

  await dazzle.applyHook('modifyDevServerConfig', async (plugin) => {
    devServerConfiguration = await plugin.modifyDevServerConfig(dazzle, devServerConfiguration);
  });
  return devServerConfiguration;
}
