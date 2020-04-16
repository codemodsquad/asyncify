"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = convertConditionalReturns;

var t = _interopRequireWildcard(require("@babel/types"));

var _restOfBlockStatement = _interopRequireDefault(require("./restOfBlockStatement"));

function isLastStatementInBlock(path) {
  var parentPath = path.parentPath;
  if (!parentPath.isBlockStatement()) return true;
  var body = parentPath.get('body');
  return path === body[body.length - 1];
}

function isInBranch(path, branch) {
  var parentPath = path.parentPath;
  if (parentPath.isIfStatement()) return path === parentPath.get(branch);

  if (parentPath.isBlockStatement()) {
    var grandparent = parentPath.parentPath;
    return grandparent.isIfStatement() && parentPath === grandparent.get(branch);
  }

  return false;
}

var isInConsequent = function isInConsequent(path) {
  return isInBranch(path, 'consequent');
};

var isInAlternate = function isInAlternate(path) {
  return isInBranch(path, 'alternate');
};

function convertToBlockStatement(blockOrExpression) {
  if (blockOrExpression.isBlockStatement()) return blockOrExpression;
  return blockOrExpression.replaceWith(t.blockStatement(blockOrExpression.node == null ? [] : [blockOrExpression.isStatement() ? blockOrExpression.node : t.expressionStatement(blockOrExpression.node)]))[0];
}

function addRestToConsequent(path) {
  var ifStatement = path.findParent(function (p) {
    return p.isIfStatement();
  });
  if (!ifStatement) throw new Error('failed to find parent IfStatement');
  var rest = (0, _restOfBlockStatement["default"])(ifStatement);
  if (!rest.length) return;
  var consequent = ifStatement.get('consequent');
  var restNodes = rest.map(function (path) {
    return path.node;
  });
  convertToBlockStatement(consequent).pushContainer('body', restNodes);
  rest.forEach(function (path) {
    return path.remove();
  });
}

function addRestToAlternate(path) {
  var ifStatement = path.findParent(function (p) {
    return p.isIfStatement();
  });
  if (!ifStatement) throw new Error('failed to find parent IfStatement');
  var rest = (0, _restOfBlockStatement["default"])(ifStatement);
  if (!rest.length) return;
  var alternate = ifStatement;

  while (alternate.isIfStatement()) {
    alternate = alternate.get('alternate');
  }

  var restNodes = rest.map(function (path) {
    return path.node;
  });
  convertToBlockStatement(alternate).pushContainer('body', restNodes);
  rest.forEach(function (path) {
    return path.remove();
  });
}

function convertConditionalReturns(parent) {
  var isUnwindable = true;
  var ifDepth = 0;
  var returnStatements = [];
  parent.traverse({
    IfStatement: {
      enter: function enter() {
        ifDepth++;
      },
      exit: function exit() {
        ifDepth--;
      }
    },
    ReturnStatement: function (_ReturnStatement) {
      function ReturnStatement(_x) {
        return _ReturnStatement.apply(this, arguments);
      }

      ReturnStatement.toString = function () {
        return _ReturnStatement.toString();
      };

      return ReturnStatement;
    }(function (path) {
      if (ifDepth > 1 || !isLastStatementInBlock(path)) {
        isUnwindable = false;
        path.stop();
        return;
      }

      var parentPath = path.parentPath;

      while (parentPath && parentPath !== parent) {
        if (parentPath.isLoop() || parentPath.isSwitchCase() || parentPath.isTryStatement()) {
          isUnwindable = false;
          path.stop();
          return;
        }

        ;
        var _parentPath = parentPath;
        parentPath = _parentPath.parentPath;
      }

      returnStatements.push(path);
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
  }, parent.state);
  if (!isUnwindable) return false;
  var returnStatement;

  while (returnStatement = returnStatements.pop()) {
    if (isInConsequent(returnStatement)) addRestToAlternate(returnStatement);else if (isInAlternate(returnStatement)) addRestToConsequent(returnStatement);
  }

  return true;
}