declare global {
    export namespace DazzleTypes {
        export interface Plugins {
        }

        export interface Config {
            modifyContext: (context: DazzleTypes.Context) => DazzleTypes.Context
        }

        export interface Context {
            plugins: Plugins
        }
    }
}

export {};