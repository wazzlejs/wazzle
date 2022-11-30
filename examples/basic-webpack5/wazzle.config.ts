import { webpack5Plugin, WebpackContext, WebpackConfig } from '@wazzle/webpack5';
import { WazzleConfig, WazzleContext, WazzlePlugin } from '@wazzle/wazzle';
import { webpack5BabelPlugin } from '@wazzle/webpack5-babel';

console.log('...........we are running this');

class LocalPlugin implements WazzlePlugin {
  name = 'local-plugin';

  modifyWebpackConfig(context: WazzleContext, webpackContext: WebpackContext, config: WebpackConfig): WebpackConfig {
    console.log('THE CONFIG IS', JSON.stringify(config));
    return config;
  }
}

const config: WazzleConfig = {
  plugins: [webpack5Plugin(), webpack5BabelPlugin(), new LocalPlugin()],
  modifyWebpackConfig(context: WazzleContext, webpackContext: WebpackContext, config: WebpackConfig): WebpackConfig {
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
