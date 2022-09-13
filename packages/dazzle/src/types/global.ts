declare global {
    export namespace RazzleTypes {
        export interface RazzleConfig {
            modifyWebpack5Options: (options: RazzleTypes.RazzleWebpack5Options) => RazzleTypes.RazzleWebpack5Options;
            modifyWebpack5Config: (config: ̧unknown, options: RazzleTypes.RazzleWebpack5Options) => RazzleTypes.RazzleWebpack5Options;
        }
        export interface RazzleContext {
            
        }
        export interface RazzleWebpack5Options {
            
        }
    }
}

export {};