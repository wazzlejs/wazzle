import browserslist from 'browserslist';
import { WazzlePlugin, WazzleContext } from '@wazzle/wazzle';

class Webpack5BrowserslistPlugin implements WazzlePlugin {
  name = 'webpack5-browserslist';

  modifyContext(context: WazzleContext) {
    let foundEnvs: string[] = [];

    const matrixNames = Object.keys(context.buildMatrix);

    for (const matrixName of matrixNames) {
      const buildConfig = context.buildMatrix[matrixName];
      const allTargets = buildConfig.targets;

      for (const buildTarget of allTargets) {
        try {
          browserslist(null, {
            env: `${matrixName}-${buildTarget}`,
            throwOnMissing: true,
          });
          foundEnvs.push(`${matrixName}-${buildTarget}`);
        } catch (error) {
          console.error('could not load `${matrixName}-${buildTarget}`', error);
        }
      }
    }
    context.browserslistEnvs = foundEnvs;
    console.log('Found the following envs:', foundEnvs);
    return context;
  }
}

export function webpack5BrowserslistPlugin(): Webpack5BrowserslistPlugin {
  return new Webpack5BrowserslistPlugin();
}
