"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = renameBoundIdentifiers;

function renameBoundIdentifiers(parent, destScope) {
  function isBound(name) {
    return parent.scope.hasBinding(name) || destScope.hasBinding(name);
  }

  function rename(path) {
    var newName = path.node.name;
    var counter = 0;

    while (isBound(newName)) {
      newName = "".concat(path.node.name).concat(counter++);
    }

    path.scope.rename(path.node.name, newName);
  }

  function mustRename(path) {
    var _path$scope$getBindin;

    var name = path.node.name;
    return destScope.hasBinding(name) && path.isBindingIdentifier() && (destScope.hasBinding(name) && parent.scope.getBindingIdentifier(name) === path.node || ((_path$scope$getBindin = path.scope.getBinding(name)) === null || _path$scope$getBindin === void 0 ? void 0 : _path$scope$getBindin.kind) === 'var');
  }

  if (parent.isIdentifier() && mustRename(parent)) rename(parent);
  parent.traverse({
    Identifier: function (_Identifier) {
      function Identifier(_x) {
        return _Identifier.apply(this, arguments);
      }

      Identifier.toString = function () {
        return _Identifier.toString();
      };

      return Identifier;
    }(function (path) {
      if (mustRename(path)) rename(path);
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
      path.skipKey('body');
    })
  }, parent.state);
}