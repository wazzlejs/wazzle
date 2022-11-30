import {} from '@wazzle/wazzle';
import {} from '@wazzle/webpack5';

declare module '@wazzle/wazzle/types' {
  export interface WazzleContext {
    browserslistEnvs?: string[];
  }
}
