import PluginTransformDefine from 'babel-plugin-transform-define';
// @ts-ignore
import { createConfigItem, loadOptionsAsync, loadPartialConfig } from '@babel/core';
import loadConfig from '@babel/core/lib/config';
import commonJsPlugin from '../plugins/commonjs.js';
import noAnonymousDefaultExport from '../plugins/no-anonymous-default-export.js';

import { DazzleWebpack5LoaderContext, DazzleWebpack5LoaderOptions, Source, SourceMap } from './types';
import { consumeIterator } from './util.js';

/**
 * The properties defined here are the conditions with which subsets of inputs
 * can be identified that are able to share a common Babel config.  For example,
 * in dev mode, different transforms must be applied to a source file depending
 * on whether you're compiling for the client or for the server - thus `isServer`
 * is germane.
 *
 * However, these characteristics need not protect against circumstances that
 * will not be encountered in Next.js.  For example, a source file may be
 * transformed differently depending on whether we're doing a production compile
 * or for HMR in dev mode.  However, those two circumstances will never be
 * encountered within the context of a single V8 context (and, thus, shared
 * cache).  Therefore, hasReactRefresh is _not_ germane to caching.
 *
 * NOTE: This approach does not support multiple `.babelrc` files in a
 * single project.  A per-cache-key config will be generated once and,
 * if `.babelrc` is present, that config will be used for any subsequent
 * transformations.
 */
interface CharacteristicsGermaneToCaching {
  dazzleBuildName: string;
  isServer: boolean;
  hasModuleExports: boolean;
  fileExt: string;
}

const fileExtensionRegex = /\.([a-z]+)$/;

function getCacheCharacteristics(
  loaderOptions: DazzleWebpack5LoaderOptions,
  source: Source,
  filename: string
): CharacteristicsGermaneToCaching {
  const { isServer, dazzleBuildName = 'default' } = loaderOptions;
  const hasModuleExports = source?.indexOf('module.exports') !== -1;
  const fileExt = fileExtensionRegex.exec(filename)?.[1] || 'unknown';

  return {
    dazzleBuildName,
    isServer,
    hasModuleExports,
    fileExt,
  };
}

function getTargetsToUse({ browserslistEnv, isServer, dazzleBuildName }: DazzleWebpack5LoaderOptions) {
  if (dazzleBuildName && browserslistEnv && browserslistEnv.includes(dazzleBuildName)) {
    return undefined;
  }

  if (isServer) {
    return {
      node: process.versions.node,
    };
  }
  if (browserslistEnv == undefined) {
    return 'default';
  }
  return undefined;
}

/**
 * Return an array of Babel plugins, conditioned upon loader options and
 * source file characteristics.
 */
function getPlugins(loaderOptions: DazzleWebpack5LoaderOptions, cacheCharacteristics: CharacteristicsGermaneToCaching) {
  const { isServer, hasModuleExports } = cacheCharacteristics;

  const { hasReactRefresh, development } = loaderOptions;

  const applyCommonJsItem = hasModuleExports ? createConfigItem(commonJsPlugin, { type: 'plugin' }) : null;
  /*   const reactRefreshItem = hasReactRefresh
    ? createConfigItem(
        [require('react-refresh/babel'), { skipEnvCheck: true }],
        { type: 'plugin' }
      )
    : null */
  const noAnonymousDefaultExportItem =
    hasReactRefresh && !isServer ? createConfigItem([noAnonymousDefaultExport, {}], { type: 'plugin' }) : null; /*
  const pageConfigItem =
    !isServer && isPageFile
      ? createConfigItem([require('../plugins/next-page-config')], {
          type: 'plugin',
        })
      : null
  const disallowExportAllItem =
    !isServer && isPageFile
      ? createConfigItem(
          [require('../plugins/next-page-disallow-re-export-all-exports')],
          { type: 'plugin' }
        )
      : null */
  const transformDefineItem = createConfigItem(
    [
      PluginTransformDefine,
      {
        'process.env.NODE_ENV': development ? 'development' : 'production',
        'typeof window': isServer ? 'undefined' : 'object',
        'process.browser': !isServer,
      },
      'dazzle-js-transform-define-instance',
    ],
    { type: 'plugin' }
  );
  /*   const nextSsgItem =
    !isServer && isPageFile
      ? createConfigItem([require.resolve('../plugins/next-ssg-transform')], {
          type: 'plugin',
        })
      : null */
  /*   const commonJsItem = isNextDist
    ? createConfigItem(
        require('next/dist/compiled/babel/plugin-transform-modules-commonjs'),
        { type: 'plugin' }
      )
    : null */

  return [
    noAnonymousDefaultExportItem,
    // reactRefreshItem,
    // pageConfigItem,
    // disallowExportAllItem,
    applyCommonJsItem,
    transformDefineItem,
    // nextSsgItem,
    // commonJsItem,
  ].filter(Boolean);
}

const isJsonFile = /\.(json|babelrc)$/;
const isJsFile = /\.[c|m]js$/;

/**
 * Generate a new, flat Babel config, ready to be handed to Babel-traverse.
 * This config should have no unresolved overrides, presets, etc.
 */
async function getFreshConfig(
  this: DazzleWebpack5LoaderContext,
  cacheCharacteristics: CharacteristicsGermaneToCaching,
  loaderOptions: DazzleWebpack5LoaderOptions,
  target: string | [string, string],
  filename: string,
  inputSourceMap?: SourceMap
) {
  const { isServer, development, hasJsxRuntime, configFile, browserslistEnv } = loaderOptions;

  const options = {
    targets: getTargetsToUse(loaderOptions),
    babelrc: true,
    cloneInputAst: false,
    browserslistEnv: loaderOptions.browserslistEnv,
    filename,
    inputSourceMap: inputSourceMap || undefined,

    // Set the default sourcemap behavior based on Webpack's mapping flag,
    // but allow users to override if they want.
    sourceMaps: loaderOptions.sourceMaps === undefined ? this.sourceMap : loaderOptions.sourceMaps,

    // Ensure that Webpack will get a full absolute path in the sourcemap
    // so that it can properly map the module back to its internal cached
    // modules.
    sourceFileName: filename,

    plugins: [...getPlugins(loaderOptions, cacheCharacteristics)],

    presets: (() => {
      return ['@wazzle/babel-loader/preset'];
    })(),

    overrides: loaderOptions.overrides,

    caller: {
      name: 'babel-loader',

      supportsStaticESM: true,
      supportsDynamicImport: true,

      // Provide plugins with insight into webpack target.
      // https://github.com/babel/babel-loader/issues/787
      target: target,

      // Webpack 5 supports TLA behind a flag. We enable it by default
      // for Babel, and then webpack will throw an error if the experimental
      // flag isn't enabled.
      supportsTopLevelAwait: true,

      isServer,
      isDev: development,
      hasJsxRuntime,
      hasModuleExports: cacheCharacteristics.hasModuleExports,
      dazzleBuildName: cacheCharacteristics.dazzleBuildName,
      fileExt: cacheCharacteristics.fileExt,

      ...loaderOptions.caller,
    },
  } as any;

  // Babel does strict checks on the config so undefined is not allowed
  if (options.target === undefined) {
    delete options.target;
  }

  if (options.targets === undefined) {
    delete options.targets;
  }

  // Babel does strict checks on the config so undefined is not allowed
  if (options.browserslistEnv === undefined) {
    delete options.browserslistEnv;
  }

  Object.defineProperty(options.caller, 'onWarning', {
    enumerable: false,
    writable: false,
    value: (reason: any) => {
      if (!(reason instanceof Error)) {
        reason = new Error(reason);
      }
      this.emitWarning(reason);
    },
  });

  console.log(cacheCharacteristics);
  //  console.log(options);

  const loadedOptions = (await loadOptionsAsync(options)) || undefined;
  const config = consumeIterator(loadConfig(loadedOptions));
  return config;
}

/**
 * Each key returned here corresponds with a Babel config that can be shared.
 * The conditions of permissible sharing between files is dependent on specific
 * file attributes and Dazzle compiler states: `CharacteristicsGermaneToCaching`.
 */
function getCacheKey(cacheCharacteristics: CharacteristicsGermaneToCaching) {
  const { isServer, hasModuleExports, fileExt, dazzleBuildName } = cacheCharacteristics;

  const flags = 0 | (isServer ? 0b0001 : 0) | (hasModuleExports ? 0b0010 : 0);

  return dazzleBuildName + '_' + fileExt + flags;
}

type BabelConfig = any;
const configCache: Map<any, BabelConfig> = new Map();
const configFiles: Set<string> = new Set();

export async function getConfig(
  this: DazzleWebpack5LoaderContext,
  {
    source,
    target,
    loaderOptions,
    filename,
    inputSourceMap,
  }: {
    source: Source;
    loaderOptions: DazzleWebpack5LoaderOptions;
    target: string | [string, string];
    filename: string;
    inputSourceMap?: SourceMap;
  }
): Promise<BabelConfig> {
  const cacheCharacteristics = getCacheCharacteristics(loaderOptions, source, filename);

  if (loaderOptions.configFile) {
    // Ensures webpack invalidates the cache for this loader when the config file changes
    this.addDependency(loaderOptions.configFile);
  }

  const cacheKey = getCacheKey(cacheCharacteristics);

  if (configCache.has(cacheKey)) {
    const cachedConfig = configCache.get(cacheKey);

    return {
      ...cachedConfig,
      options: {
        ...cachedConfig.options,
        cwd: loaderOptions.cwd,
        root: loaderOptions.cwd,
        filename,
        sourceFileName: filename,
      },
    };
  }

  if (loaderOptions.configFile && !configFiles.has(loaderOptions.configFile)) {
    configFiles.add(loaderOptions.configFile);
    /*     Log.info(
      `Using external babel configuration from ${loaderOptions.configFile}`
    ) */
  }

  const freshConfig = await getFreshConfig.call(
    this,
    cacheCharacteristics,
    loaderOptions,
    target,
    filename,
    inputSourceMap
  );

  configCache.set(cacheKey, freshConfig);

  return freshConfig;
}
