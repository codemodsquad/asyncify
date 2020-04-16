"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = findPromiseChains;

var _predicates = require("./predicates");

function findPromiseChains(path) {
  var chains = [];
  path.traverse({
    CallExpression: function (_CallExpression) {
      function CallExpression(_x) {
        return _CallExpression.apply(this, arguments);
      }

      CallExpression.toString = function () {
        return _CallExpression.toString();
      };

      return CallExpression;
    }(function (path) {
      if ((0, _predicates.isPromiseMethodCall)(path.node)) {
        chains.push(path);
        path.skip();
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
  return chains;
}