/* eslint-disable import/no-extraneous-dependencies */
// @ts-nocheck
import { transform } from '@babel/core';
import plugin from './commonjs';

const testPlugin = (code) => {
  const result = transform(code, {
    plugins: [plugin],
    configFile: false,
  });

  return result.code;
};

describe('plugin', () => {
  describe('simple import', () => {
    it('should work with template literal', () => {
      const result = testPlugin(`
        module.exports = true;
      `);

      expect(result).toMatchInlineSnapshot(`
        ""use strict";

        module.exports = true;"
      `);
    });
  });
});
