"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = returnsOrAwaitsPromises;

var _predicates = require("./predicates");

function returnsOrAwaitsPromises(path) {
  if (path.node.async) return true;
  var result = false;
  var body = path.get('body');

  if (!body.isBlockStatement()) {
    return (0, _predicates.isPromiseValued)(body.node);
  }

  body.traverse({
    ReturnStatement: function (_ReturnStatement) {
      function ReturnStatement(_x) {
        return _ReturnStatement.apply(this, arguments);
      }

      ReturnStatement.toString = function () {
        return _ReturnStatement.toString();
      };

      return ReturnStatement;
    }(function (path) {
      var argument = path.node.argument;

      if (argument && (0, _predicates.isPromiseValued)(argument)) {
        result = true;
        path.stop();
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
  }, body.state);
  return result;
}