"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = replaceReturnStatements;

var t = _interopRequireWildcard(require("@babel/types"));

function replaceReturnStatements(path, getReplacement) {
  path.traverse({
    ReturnStatement: function (_ReturnStatement) {
      function ReturnStatement(_x) {
        return _ReturnStatement.apply(this, arguments);
      }

      ReturnStatement.toString = function () {
        return _ReturnStatement.toString();
      };

      return ReturnStatement;
    }(function (path) {
      var replacement = getReplacement(path.node.argument || t.identifier('undefined'));

      if (replacement.type === 'ReturnStatement') {
        var _ref = replacement,
            argument = _ref.argument;
        if (argument) path.get('argument').replaceWith(argument);else path.get('argument').remove();
      } else path.replaceWith(replacement);
    }),
    Function: function (_Function) {
      function Function(_x2) {
        return _Function.apply(this, arguments);
      }

      Function.toString = function () {
        return _Function.toString();
      };

      return Function;
    }(function (path) {
      path.skip();
    })
  }, path.state);
  return path;
}