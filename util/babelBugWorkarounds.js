"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = babelBugWorkarounds;

function babelBugWorkarounds(path) {
  path.traverse({
    ObjectProperty: function (_ObjectProperty) {
      function ObjectProperty(_x) {
        return _ObjectProperty.apply(this, arguments);
      }

      ObjectProperty.toString = function () {
        return _ObjectProperty.toString();
      };

      return ObjectProperty;
    }(function (path) {
      var node = path.node;

      if (node.shorthand && node.key.type === 'Identifier' && node.value.type === 'Identifier' && node.key.name !== node.value.name) {
        node.shorthand = false;
      }
    })
  });
}