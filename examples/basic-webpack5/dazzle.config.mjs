import {webpack5Plugin} from "@elzzad/dazzle-plugin-webpack5";
import { webpack5BabelPlugin } from '@elzzad/dazzle-plugin-webpack5-babel';

class LocalPlugin {
    name = 'local-plugin';

    modifyWebpackConfig(context, webpackContext, config) {
        console.log('THE CONFIG IS', JSON.stringify(config,null, 2));
        return config;
    }
    
}

const config = {
    plugins: [webpack5Plugin(), webpack5BabelPlugin(), new LocalPlugin()],
};
export default config;
