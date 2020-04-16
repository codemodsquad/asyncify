"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = hasMutableIdentifiers;

function hasMutableIdentifiers(path) {
  var result = false;
  path.traverse({
    Identifier: function (_Identifier) {
      function Identifier(_x) {
        return _Identifier.apply(this, arguments);
      }

      Identifier.toString = function () {
        return _Identifier.toString();
      };

      return Identifier;
    }(function (path) {
      if (path.isBindingIdentifier()) {
        var binding = path.scope.getBinding(path.node.name);
        if (!binding) return;

        if (!binding.constant) {
          path.stop();
          result = true;
        }
      }
    })
  }, path.state);
  return result;
}