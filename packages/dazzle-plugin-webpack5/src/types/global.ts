import { Webpack5Plugin } from "./types";

import { Configuration } from "webpack";
import { Configuration as DevServerConfiguration } from "webpack-dev-server";

declare global {
    export namespace DazzleTypes {
        export interface Plugins {
          webpack5: Webpack5Plugin;
        }

        export interface Config {
            modifyWebpack5Context: (webpack5Context: DazzleTypes.Webpack5Context, DazzleContext: DazzleTypes.Context) => DazzleTypes.Webpack5Context;
            modifyWebpack5Config: (config: Configuration, webpack5Context: DazzleTypes.Webpack5Context) => DazzleTypes.Webpack5Context;
        }
        export interface Context {
            devMatrixName: string;
            buildMatrix: Record<string, DazzleTypes.BuildConfig>;
        }

        export interface BuildConfig {
            targets: Array<string>;
            depends?: Record<string, Array<string> | string>;
        }

        export interface Webpack5Plugins {
        }
      
        export interface Webpack5Context {
            plugin: Webpack5Plugin;
            plugins: Webpack5Plugins;
            matrixName: string;
            buildTargets: Array<string>;
            buildTarget: string;
            buildName: string;
            isDevEnv: boolean;
            isDev: boolean;
            isProd: boolean;
            isClient: boolean;
            isServer: boolean
        }
    }
}
