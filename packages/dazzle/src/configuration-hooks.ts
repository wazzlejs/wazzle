import { DazzleContext } from './types';
import { logger } from './logger';

export interface ConfigurationHooks {
  modifyContext?: (context: DazzleContext) => DazzleContext;
}

export type ApplyHookFunction = <THook extends keyof ConfigurationHooks>(
  hook: THook,
  action: (plugin: PluginSupportingHook<THook>) => Promise<unknown>
) => Promise<void>;

type PluginSupportingHook<THook extends keyof ConfigurationHooks> = Required<Pick<ConfigurationHooks, THook>>;

type NamedThingWithHooks = ConfigurationHooks & { name: string };

function hasHook<THook extends keyof ConfigurationHooks>(hook: THook) {
  return function (plugin: NamedThingWithHooks): plugin is PluginSupportingHook<THook> & NamedThingWithHooks {
    logger.debug(`Checking if ${plugin.name} has hook ${hook} ${typeof plugin[hook]}`);
    return typeof plugin[hook] === 'function';
  };
}

export const applyHook: ApplyHookFunction = async function (this: DazzleContext, hook, action) {
  logger.debug('Applying hook', hook);
  const pluginsWithHooks = (this.plugins as NamedThingWithHooks[]).filter(hasHook(hook));
  for (const plugin of pluginsWithHooks) {
    await action(plugin);
  }
  if (hasHook(hook)(this)) {
    await action(this);
  }
};
