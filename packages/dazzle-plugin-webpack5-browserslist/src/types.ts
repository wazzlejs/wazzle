import {} from '@elzzad/dazzle';
import {} from '@elzzad/dazzle-plugin-webpack5';

declare module '@elzzad/dazzle/types' {
  export interface DazzleContext {
    browserslistEnvs?: string[];
  }
}
