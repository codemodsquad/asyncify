"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = ensureAsync;

var _builders = require("./builders");

function ensureAsync(path) {
  path.node.async = true;
  path.get('body').traverse({
    ReturnStatement: function (_ReturnStatement) {
      function ReturnStatement(_x) {
        return _ReturnStatement.apply(this, arguments);
      }

      ReturnStatement.toString = function () {
        return _ReturnStatement.toString();
      };

      return ReturnStatement;
    }(function (path) {
      var argument = path.get('argument');

      if (argument.node && !argument.isAwaitExpression()) {
        argument.replaceWith((0, _builders.awaited)(argument.node));
      }
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
}