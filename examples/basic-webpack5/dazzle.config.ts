import { webpack5Plugin, WebpackContext, WebpackConfig } from '@elzzad/dazzle-plugin-webpack5';
import { DazzleConfig, DazzleContext, DazzlePlugin } from '@elzzad/dazzle';
import { webpack5BabelPlugin } from '@elzzad/dazzle-plugin-webpack5-babel';

console.log('...........we are running this');

class LocalPlugin implements DazzlePlugin {
  name = 'local-plugin';

  modifyWebpackConfig(context: DazzleContext, webpackContext: WebpackContext, config: WebpackConfig): WebpackConfig {
    console.log('THE CONFIG IS', JSON.stringify(config));
    return config;
  }
}

const config: DazzleConfig = {
  plugins: [webpack5Plugin(), webpack5BabelPlugin(), new LocalPlugin()],
  modifyWebpackConfig(config) {
    console.log('HERE IS THE CONFIG', config);
    return config;
  },
  modifyDevServerConfig(config) {
    console.log('The dev server config is  ', config);
  },
  modifyContext(context) {
    console.log('HERE IS THE context', context);
    return context;
  },
};

export default config;
