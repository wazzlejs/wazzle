import { Webpack5Plugin } from "./types";

declare global {
    export namespace RazzleTypes {
        export interface Plugins {
          webpack5: Webpack5Plugin;
        }

        export interface Config {
            modifyWebpack5Context: (webpack5Context: RazzleTypes.Webpack5Context, razzleContext: RazzleTypes.Context) => RazzleTypes.Webpack5Context;
            modifyWebpack5Config: (config: unknown, webpack5Context: RazzleTypes.Webpack5Context) => RazzleTypes.Webpack5Context;
        }
        export interface Context {
        }

        export interface Webpack5Plugins {
        }
      
        export interface Webpack5Context {
            plugin: Webpack5Plugin;
            plugins: Webpack5Plugins;
        }
    }
}
