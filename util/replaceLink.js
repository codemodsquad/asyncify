"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = replaceLink;

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var t = _interopRequireWildcard(require("@babel/types"));

var _traverse = require("@babel/traverse");

var _template = _interopRequireDefault(require("@babel/template"));

var _predicates = require("./predicates");

var _renameBoundIdentifiers = _interopRequireDefault(require("./renameBoundIdentifiers"));

var _unboundIdentifier = _interopRequireDefault(require("./unboundIdentifier"));

var _replaceReturnStatements = _interopRequireDefault(require("./replaceReturnStatements"));

var _builders = require("./builders");

var _parentStatement = _interopRequireDefault(require("./parentStatement"));

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["let ", ""]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["let ", ""]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function findReplaceTarget(link) {
  var parentPath = link.parentPath;
  if (parentPath.isAwaitExpression()) return findReplaceTarget(parentPath);

  if (parentPath.isReturnStatement() || parentPath.isExpressionStatement() || (0, _predicates.isIdentifierAssignmentExpression)(parentPath)) {
    return parentPath;
  }

  if ((0, _predicates.isIdentifierDeclarator)(parentPath)) {
    var declaration = parentPath.parentPath;

    if (declaration.isVariableDeclaration() && declaration.node.declarations.length === 1) {
      return declaration;
    }
  }

  return link;
}

function findOnlyFinalReturn(path) {
  var count = 0;
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
      if (count++) path.stop();
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
  if (count !== 1) return null;
  var body = path.get('body');
  var last = body[body.length - 1];
  return last.isReturnStatement() ? last : null;
}

function replaceLink(link, replacement) {
  if (!(replacement instanceof _traverse.NodePath)) {
    var parentPath = link.parentPath;
    return (parentPath.isAwaitExpression() ? parentPath : link).replaceWith((0, _builders.awaited)(replacement));
  }

  if (replacement.isBlockStatement()) {
    var target = findReplaceTarget(link);
    (0, _renameBoundIdentifiers["default"])(replacement, link.scope);
    var onlyFinalReturn = findOnlyFinalReturn(replacement);

    if (onlyFinalReturn) {
      var value = onlyFinalReturn.node.argument || t.identifier('undefined');
      onlyFinalReturn.remove();
      var output = (0, _parentStatement["default"])(link).insertBefore(replacement.node.body);
      var _parentPath = link.parentPath;

      var _target = _parentPath.isAwaitExpression() ? _parentPath : link;

      _target.replaceWith((0, _builders.awaited)(value));

      return output;
    }

    if (target.isReturnStatement()) {
      (0, _replaceReturnStatements["default"])(replacement, function (argument) {
        return t.returnStatement((0, _builders.awaited)(argument));
      });
      return target.replaceWithMultiple(replacement.node.body);
    } else if (target.isExpressionStatement()) {
      (0, _replaceReturnStatements["default"])(replacement, function (argument) {
        return t.expressionStatement((0, _builders.awaited)(argument));
      });
      return target.replaceWithMultiple(replacement.node.body);
    } else if (target.isVariableDeclaration()) {
      var _target$node$declarat = (0, _slicedToArray2["default"])(target.node.declarations, 1),
          id = _target$node$declarat[0].id;

      replacement.unshiftContainer('body', _template["default"].statements.ast(_templateObject(), id));
      (0, _replaceReturnStatements["default"])(replacement, function (argument) {
        return t.expressionStatement(t.assignmentExpression('=', id, (0, _builders.awaited)(argument)));
      });
      return target.replaceWithMultiple(replacement.node.body);
    } else if (target.isAssignmentExpression()) {
      var _target$node = target.node,
          left = _target$node.left,
          operator = _target$node.operator;
      (0, _replaceReturnStatements["default"])(replacement, function (argument) {
        return t.expressionStatement(t.assignmentExpression(operator, left, (0, _builders.awaited)(argument)));
      });
      return target.replaceWithMultiple(replacement.node.body);
    } else {
      var result = (0, _unboundIdentifier["default"])(replacement, 'result');
      replacement.unshiftContainer('body', _template["default"].statements.ast(_templateObject2(), result));
      (0, _replaceReturnStatements["default"])(replacement, function (argument) {
        return t.expressionStatement(t.assignmentExpression('=', result, (0, _builders.awaited)(argument)));
      });

      var _output = (0, _parentStatement["default"])(target).insertBefore(replacement.node.body);

      target.replaceWith(result);
      return _output;
    }
  } else {
    var _parentPath2 = link.parentPath;
    return (_parentPath2.isAwaitExpression() ? _parentPath2 : link).replaceWith((0, _builders.awaited)(replacement.node));
  }
}