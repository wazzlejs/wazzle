/* eslint-disable import/no-extraneous-dependencies */
// @ts-nocheck
import { transform } from '@babel/core';
import commonjs from './commonjs';

const testPlugin = (plugin, code) => {
  const result = transform(code, {
    plugins: [plugin],
    presets: ['@babel/preset-env', '@babel/preset-react'],
    configFile: false,
  });

  return result.code;
};

it('should transform es6', () => {
  const result = testPlugin(
    commonjs,
    `
        export default true;
      `
  );

  expect(result).toMatchInlineSnapshot(`
    "\\"use strict\\";

    Object.defineProperty(exports, \\"__esModule\\", {
      value: true
    });
    exports[\\"default\\"] = void 0;
    var _default = true;
    exports[\\"default\\"] = _default;"
  `);
});
