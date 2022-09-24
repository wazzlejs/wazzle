import {webpack5Plugin} from "@elzzad/dazzle-plugin-webpack5";
import {webpack5ExternalsPlugin} from '@elzzad/dazzle-plugin-webpack5-externals';

const config = {
    plugins: [webpack5Plugin(), webpack5ExternalsPlugin()],
};
export default config;
