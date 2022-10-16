import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { loadRazzleConfig } from './loaders/load-razzle-config';
import { DazzlePlugin, ProvidesCommands } from './types';

export async function cli(): Promise<void> {
  const dazzleContext = await loadRazzleConfig();
  let argv = yargs(hideBin(process.argv))
    .scriptName('dazzle')
    .option('d', {
      type: 'boolean',
      alias: 'debug',
      describe: 'enable debug option',
    })
    .option('v', {
      type: 'boolean',
      alias: 'verbose',
      describe: 'enable debug option',
    })
    .option('c', {
      type: 'string',
      alias: 'config',
      describe: 'load config file',
    });

  dazzleContext.plugins.filter(hasCommands).forEach((plugin) => {
    plugin.addCommands(argv, dazzleContext);
  });
  argv.parse();
}

function hasCommands(plugin: DazzlePlugin): plugin is DazzlePlugin & ProvidesCommands {
  return plugin.addCommands !== undefined;
}
