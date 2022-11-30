import { dirname } from 'path';

import pluginTransformReactRemovePropTypes from 'babel-plugin-transform-react-remove-prop-types';

import { PluginItem } from '@babel/core';
import pluginProposalClassProperties from '@babel/plugin-proposal-class-properties';
import pluginProposalExportNamespaceFrom from '@babel/plugin-proposal-export-namespace-from';
import pluginProposalNumericSeparator from '@babel/plugin-proposal-numeric-separator';
import pluginProposalObjectRestSpread from '@babel/plugin-proposal-object-rest-spread';
import pluginSyntaxBigint from '@babel/plugin-syntax-bigint';
import pluginSyntaxDynamicImport from '@babel/plugin-syntax-dynamic-import';
import pluginTransformRuntime from '@babel/plugin-transform-runtime';
import presetEnv from '@babel/preset-env';
import presetReact from '@babel/preset-react';
import presetTypescript from '@babel/preset-typescript';

import jsxPragma from './plugins/jsx-pragma.js';
import optimizeHookDestructuring from './plugins/optimize-hook-destructuring.js';

const isLoadIntentTest = process.env.NODE_ENV === 'test';
const isLoadIntentDevelopment = process.env.NODE_ENV === 'development';

type WazzleBabelPresetOptions = {
  'preset-env'?: any;
  'preset-react'?: any;
  'class-properties'?: any;
  'transform-runtime'?: any;
  'preset-typescript'?: any;
};

interface BabelPreset {
  targets?: unknown;
  presets?: PluginItem[] | null;
  plugins?: PluginItem[] | null;
  sourceType?: 'script' | 'module' | 'unambiguous';
  overrides?: Array<{ test: RegExp } & Omit<BabelPreset, 'overrides'>>;
}

interface CallerOptions {
  supportsStaticESM?: unknown;
}

function supportsStaticESM(caller: CallerOptions): boolean {
  return !!caller?.supportsStaticESM;
}

export default (api: any, options: WazzleBabelPresetOptions = {}): BabelPreset => {
  const supportsESM = api.caller(supportsStaticESM);
  const isServer = api.caller((caller: any) => !!caller && caller.isServer);
  const isCallerDevelopment = api.caller((caller: any) => caller?.isDev);

  // Look at external intent if used without a caller (e.g. via Jest):
  const isTest = isCallerDevelopment == null && isLoadIntentTest;

  // Look at external intent if used without a caller (e.g. Storybook):
  const isDevelopment = isCallerDevelopment === true || (isCallerDevelopment == null && isLoadIntentDevelopment);

  // Default to production mode if not 'test' nor 'development':
  const isProduction = !(isTest || isDevelopment);

  const isBabelLoader = api.caller(
    (caller: any) => !!caller && (caller.name === 'babel-loader' || caller.name === 'dazzle-babel-loader')
  );

  const useJsxRuntime =
    options['preset-react']?.runtime === 'automatic' ||
    (Boolean(api.caller((caller: any) => !!caller && caller.hasJsxRuntime)) &&
      options['preset-react']?.runtime !== 'classic');

  const presetEnvConfig = {
    exclude: ['transform-typeof-symbol'],
    include: ['@babel/plugin-proposal-optional-chaining', '@babel/plugin-proposal-nullish-coalescing-operator'],
    ...options['preset-env'],
  } as any;

  return {
    sourceType: 'unambiguous',
    //targets: isServer || isTest ? { node: 'current' } : undefined,
    presets: [
      [presetEnv, presetEnvConfig],
      [
        presetReact,
        {
          // This adds @babel/plugin-transform-react-jsx-source and
          // @babel/plugin-transform-react-jsx-self automatically in development
          development: isDevelopment || isTest,
          ...(useJsxRuntime ? { runtime: 'automatic' } : { pragma: '__jsx' }),
          ...options['preset-react'],
        },
      ],
      [presetTypescript, { allowNamespaces: true, ...options['preset-typescript'] }],
    ],
    plugins: [
      [
        'polyfill-corejs3',
        {
          method: 'usage-global',
        },
      ],
      !useJsxRuntime && [
        jsxPragma,
        {
          // This produces the following injected import for modules containing JSX:
          //   import React from 'react';
          //   var __jsx = React.createElement;
          module: 'react',
          importAs: 'React',
          pragma: '__jsx',
          property: 'createElement',
        },
      ],
      [
        optimizeHookDestructuring,
        {
          // only optimize hook functions imported from React/Preact
          lib: true,
        },
      ],
      pluginSyntaxDynamicImport,
      [pluginProposalClassProperties, options['class-properties'] || {}],
      [
        pluginProposalObjectRestSpread,
        {
          useBuiltIns: true,
        },
      ],
      !isServer && [
        pluginTransformRuntime,
        {
          absoluteRuntime: isBabelLoader ? dirname(require.resolve('@babel/runtime/package.json')) : undefined,
          ...options['transform-runtime'],
        },
      ],
      isProduction && [
        pluginTransformReactRemovePropTypes,
        {
          removeImport: true,
        },
      ],
      isServer && pluginSyntaxBigint,
      // Always compile numeric separator because the resulting number is
      // smaller.
      pluginProposalNumericSeparator,
      pluginProposalExportNamespaceFrom,
    ].filter(Boolean),
  };
};
