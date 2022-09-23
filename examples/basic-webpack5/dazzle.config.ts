import { webpack5Plugin } from '@elzzad/dazzle-plugin-webpack5';
import { DazzleConfig } from '@elzzad/dazzle';

const config: DazzleConfig = {
  plugins: [webpack5Plugin()],
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
