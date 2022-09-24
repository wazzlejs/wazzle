import '@elzzad/dazzle-plugin-webpack5';

declare module '@elzzad/dazzle' {
  export interface DazzlePaths {
    appSrc: string;
    appBuild: string;
    appBuildPublic: string;
    appServerIndex: string;
    appServerPath: string;
    appClientPath: string;
  }

  export interface DazzlePluginOptions {
    webpack5Externals: Readonly<Webpack5ExternalsPluginOptions>;
  }
}

export interface Webpack5ExternalsPluginOptions {
  esmExternals: boolean | 'loose';
  notCallback?: (request: string, context: string) => boolean;
}
