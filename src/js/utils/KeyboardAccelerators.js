// (C) Copyright 2014-2015 Hewlett-Packard Development Company, L.P.

var findDOMNode = require('react').findDOMNode;

// Allow callers to use key labels instead of key code numbers.
// This makes their code easier to read.
var KEYS = {
  backspace: 8,
  tab: 9,
  enter: 13,
  esc: 27,
  escape: 27,
  space: 32,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  comma: 188,
  shift: 16
};

var _keyboardAccelerators = {};
var _listenersCounter = 0;
var _listeners = [];
var _isKeyboardAcceleratorListening = false;

var _onKeyboardAcceleratorKeyPress = function (e) {
  var key = (e.keyCode ? e.keyCode : e.which);
  for (var i = _listenersCounter - 1; i >= 0; i--) {
    var id = _listeners[i];
    var handlers = _keyboardAccelerators[id].handlers;
    if (handlers.hasOwnProperty(key)) {
      if (handlers[key](e)) {
        break;
      }
    }
  }
};

// KeyboardAccelerators is a utility for handling keyboard events.
// Add listeners using startListeningToKeyboard().
// Remove listeners using stopListeningToKeyboard().
var KeyboardAccelerators = {
  _initKeyboardAccelerators: function (element) {
    var id = element.getAttribute('data-reactid');
    _keyboardAccelerators[id] = {
      handlers: {}
    };
  },

  _getKeyboardAcceleratorHandlers: function (element) {
    var id = element.getAttribute('data-reactid');
    return _keyboardAccelerators[id].handlers;
  },

  _getDowns: function (element) {
    var id = element.getAttribute('data-reactid');
    return _keyboardAccelerators[id].downs;
  },

  _isComponentListening: function (element) {
    var id = element.getAttribute('data-reactid');
    for (var i = 0; i < _listenersCounter; i++) {
      if (_listeners[i] === id) {
        return true;
      }
    }
    return false;
  },

  _subscribeComponent: function (element) {
    var id = element.getAttribute('data-reactid');
    _listeners[_listenersCounter] = id;
    _listenersCounter++;
  },

  _unsubscribeComponent: function (element) {
    var id = element.getAttribute('data-reactid');
    var i = 0;
    for (; i < _listenersCounter; i++) {
      if (_listeners[i] == id) {
        break;
      }
    }
    for (; i < _listenersCounter - 1; i++) {
      _listeners[i] = _listeners[i + 1];
    }
    _listenersCounter--;
    _listeners[_listenersCounter] = null;
    delete _keyboardAccelerators[id];
  },

  // Add handlers for specific keys.
  // This function can be called multiple times, existing handlers will
  // be replaced, new handlers will be added.
  startListeningToKeyboard: function (component, handlers) {
    var element = findDOMNode(component);
    this._initKeyboardAccelerators(element);
    var keys = 0;
    for (var key in handlers) {
      if (handlers.hasOwnProperty(key)) {
        var keyCode = key;
        if (KEYS.hasOwnProperty(key)) {
          keyCode = KEYS[key];
        }
        keys += 1;
        this._getKeyboardAcceleratorHandlers(element)[keyCode] = handlers[key];
      }
    }

    if (keys > 0) {
      if (!_isKeyboardAcceleratorListening) {
        window.addEventListener("keydown", _onKeyboardAcceleratorKeyPress);
        _isKeyboardAcceleratorListening = true;
      }
      if (!this._isComponentListening(element)) {
        this._subscribeComponent(element);
      }
    }
  },

  // Remove handlers for all keys or specific keys.
  // If no argument is passed in, all handlers are removed.
  // This function can be called multiple times, only the handlers
  // specified will be removed.
  stopListeningToKeyboard: function (component, handlers) {
    var element = findDOMNode(component);
    if (!this._isComponentListening(element)) {
      return;
    }
    if (handlers) {
      for (var key in handlers) {
        if (handlers.hasOwnProperty(key)) {
          var keyCode = key;
          if (KEYS.hasOwnProperty(key)) {
            keyCode = KEYS[key];
          }
          delete this._getKeyboardAcceleratorHandlers(element)[keyCode];
        }
      }
    }

    var keyCount = 0;
    for (var keyHandler in this._getKeyboardAcceleratorHandlers(element)) {
      if (this._getKeyboardAcceleratorHandlers(element).hasOwnProperty(keyHandler)) {
        keyCount += 1;
      }
    }

    if (! handlers || 0 === keyCount) {
      this._initKeyboardAccelerators(element);
      this._unsubscribeComponent(element);
    }

    if (_listenersCounter === 0) {
      window.removeEventListener("keydown", _onKeyboardAcceleratorKeyPress);
      _isKeyboardAcceleratorListening = false;
    }
  }
};

module.exports = KeyboardAccelerators;
