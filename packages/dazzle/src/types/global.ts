declare global {
    export namespace RazzleTypes {
        export interface RazzleConfig {
            modifyRazzleContext: (context: RazzleTypes.RazzleContext) => RazzleTypes.RazzleContext;
        }
        export interface RazzleContext {
            razzleOptions: unknown;
        }
        export interface RazzleWebpack5Options {
            
        }
    }
}

export {};