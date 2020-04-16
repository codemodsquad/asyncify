"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = finalCleanup;

var t = _interopRequireWildcard(require("@babel/types"));

var _predicates = require("./predicates");

function unwrapPromiseResolves(node) {
  while (node && (0, _predicates.isPromiseResolveCall)(node)) {
    node = node.arguments[0];
  }

  return node;
}

function finalCleanup(path) {
  path.traverse({
    AwaitExpression: function (_AwaitExpression) {
      function AwaitExpression(_x) {
        return _AwaitExpression.apply(this, arguments);
      }

      AwaitExpression.toString = function () {
        return _AwaitExpression.toString();
      };

      return AwaitExpression;
    }(function (path) {
      var argument = path.get('argument');
      var parentPath = path.parentPath;

      if (argument.isCallExpression() && (0, _predicates.isPromiseResolveCall)(argument)) {
        var value = unwrapPromiseResolves(argument.node);

        if (parentPath.isExpressionStatement() && (!value || !(0, _predicates.needsAwait)(value))) {
          parentPath.remove();
        } else if (value) {
          argument.replaceWith(value);
        }
      }
    }),
    ReturnStatement: function (_ReturnStatement) {
      function ReturnStatement(_x2) {
        return _ReturnStatement.apply(this, arguments);
      }

      ReturnStatement.toString = function () {
        return _ReturnStatement.toString();
      };

      return ReturnStatement;
    }(function (path) {
      var argument = path.get('argument');
      var value = argument.isAwaitExpression() ? argument.get('argument') : argument;

      if (value.isCallExpression() && (0, _predicates.isPromiseResolveCall)(value)) {
        var unwrapped = unwrapPromiseResolves(value.node);
        if (unwrapped) value.replaceWith(unwrapped);else argument.remove();
      } else if (value.isCallExpression() && (0, _predicates.isPromiseRejectCall)(value)) {
        path.replaceWith(t.throwStatement(t.newExpression(t.identifier('Error'), value.node.arguments.slice(0, 1))));
      } else if (argument.isAwaitExpression()) {
        argument.replaceWith(argument.node.argument);
      }
    }),
    Function: function (_Function) {
      function Function(_x3) {
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