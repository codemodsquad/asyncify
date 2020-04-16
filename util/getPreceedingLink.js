"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = getPreceedingLink;

function getPreceedingLink(link) {
  var callee = link.get('callee');

  if (!callee.isMemberExpression()) {
    throw new Error("code that uses V8 intrinsic identifiers isn't supported");
  }

  return callee.get('object');
}