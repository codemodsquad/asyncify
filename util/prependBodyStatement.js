"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = prependBodyStatement;

var _convertBodyToBlockStatement = _interopRequireDefault(require("./convertBodyToBlockStatement"));

function prependBodyStatement(func, statement) {
  return (0, _convertBodyToBlockStatement["default"])(func).unshiftContainer('body', [statement]);
}