"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = unboundIdentifier;

var t = _interopRequireWildcard(require("@babel/types"));

function unboundIdentifier(path, prefix) {
  var counter = 0;
  var name = prefix || "_ASYNCIFY_".concat(counter++);

  while (path.scope.hasBinding(name)) {
    name = "".concat(prefix || '_ASYNCIFY_').concat(counter++);
  }

  return t.identifier(name);
}