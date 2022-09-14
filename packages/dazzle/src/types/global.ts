declare global {
    export namespace RazzleTypes {
        export interface Plugins {
        }

        export interface Config {
            modifyContext: (context: RazzleTypes.Context) => RazzleTypes.Context
        }
        
        export interface Context {
            plugins: Plugins
        }
    }
}

export {};