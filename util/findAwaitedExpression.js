"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = findAwaitedExpression;

function findAwaitedExpression(paths) {
  if (Array.isArray(paths)) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = paths[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var path = _step.value;

        var _result = findAwaitedExpression(path);

        if (_result) return _result;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator["return"] != null) {
          _iterator["return"]();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return null;
  }

  var result = null;
  paths.traverse({
    AwaitExpression: function (_AwaitExpression) {
      function AwaitExpression(_x) {
        return _AwaitExpression.apply(this, arguments);
      }

      AwaitExpression.toString = function () {
        return _AwaitExpression.toString();
      };

      return AwaitExpression;
    }(function (path) {
      if (result == null) result = path.get('argument');
      path.stop();
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
  }, paths.state);
  return result;
}