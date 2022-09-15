import { Webpack5Plugin } from "./types";

declare global {
    export namespace DazzleTypes {
        export interface Plugins {
          webpack5: Webpack5Plugin;
        }

        export interface Config {
            modifyWebpack5Context: (webpack5Context: DazzleTypes.Webpack5Context, DazzleContext: DazzleTypes.Context) => DazzleTypes.Webpack5Context;
            modifyWebpack5Config: (config: unknown, webpack5Context: DazzleTypes.Webpack5Context) => DazzleTypes.Webpack5Context;
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
