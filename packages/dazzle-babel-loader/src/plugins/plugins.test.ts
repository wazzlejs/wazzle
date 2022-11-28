/* eslint-disable import/no-extraneous-dependencies */
// @ts-nocheck
import { transform } from '@babel/core';
import commonjs from './commonjs';
import jsxpragma from './jsx-pragma';

const testPlugin = (plugin, code) => {
  const result = transform(code, {
    plugins: [plugin],
    presets: ['@babel/preset-env', '@babel/preset-react'],
    configFile: false,
  });

  return result.code;
};

describe('plugin', () => {
  describe('simple usage', () => {
    it('should add use strict', () => {
      const result = testPlugin(
        commonjs,
        `
        module.exports = true;
      `
      );

      expect(result).toMatchInlineSnapshot(`
        ""use strict";

        module.exports = true;"
      `);
    });
    it('should add jsx pragma', () => {
      const result = testPlugin(
        jsxpragma,
        `
      export const component = () => {
        <div/>
      }
      `
      );

      expect(result).toMatchInlineSnapshot(`
        ""use strict";

        var _react = _interopRequireDefault(require("react"));

        function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

        var component = function component() {
          /*#__PURE__*/
          _react["default"].createElement("div", null);
        };"
      `);
    });
  });
});
