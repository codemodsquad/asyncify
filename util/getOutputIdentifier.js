"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = getOutputIdentifier;

var _unboundIdentifier = _interopRequireDefault(require("./unboundIdentifier"));

function getOutputIdentifier(link) {
  var parentPath = link.parentPath;

  if (parentPath.isAwaitExpression()) {
    var grandparentPath = parentPath.parentPath;

    if (grandparentPath.isVariableDeclarator()) {
      var id = grandparentPath.get('id');
      if (id.isIdentifier()) return id.node;
    }
  }

  return (0, _unboundIdentifier["default"])(link);
}