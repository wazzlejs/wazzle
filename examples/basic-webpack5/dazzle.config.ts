import { webpack5Plugin } from '@elzzad/dazzle-plugin-webpack5';
import { DazzleConfig } from '@elzzad/dazzle';
import { webpack5ExternalsPlugin } from '@elzzad/dazzle-plugin-webpack5-externals';

const config: DazzleConfig = {
  plugins: [webpack5Plugin(), webpack5ExternalsPlugin()],
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
