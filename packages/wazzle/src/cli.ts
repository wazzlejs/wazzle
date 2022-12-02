import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { loadWazzleConfig } from './loaders/load-wazzle-config';
import { WazzlePlugin, ProvidesCommands } from './types';

export async function cli(): Promise<void> {
  const argParser = yargs(hideBin(process.argv))
    .scriptName('dazzle')
    .option('c', {
      alias: 'config',
      type: 'string',
      description: 'Path to config file',
    })
    .string('c');
  const options = await argParser.argv;
  const dazzleContext = await loadWazzleConfig({ configFilePath: options.c });

  argParser.options({
    d: {
      type: 'boolean',
      alias: 'debug',
      describe: 'enable debug option',
    },
    v: {
      type: 'boolean',
      alias: 'verbose',
      describe: 'enable debug option',
    },
  });

  dazzleContext.plugins.filter(hasCommands).forEach((plugin) => {
    plugin.addCommands(argParser, dazzleContext);
  });
  await argParser.parse();
}

function hasCommands(plugin: WazzlePlugin): plugin is WazzlePlugin & ProvidesCommands {
  return plugin.addCommands !== undefined;
}
