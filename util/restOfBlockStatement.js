"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = restOfBlockStatement;

var _parentStatement = _interopRequireDefault(require("./parentStatement"));

function restOfBlockStatement(path) {
  var statement = (0, _parentStatement["default"])(path);
  var blockStatement = statement.parentPath;
  if (!blockStatement.isBlockStatement()) throw new Error('failed to get BlockStatement');
  var body = blockStatement.get('body');
  var index = body.indexOf(statement);
  if (index < 0) throw new Error('failed to get index of Statement within BlockStatement');
  return body.slice(index + 1);
}