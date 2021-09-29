const util = require('util')
const AbstractLevelDOWN = require('abstract-leveldown').AbstractLevelDOWN
const binding = require('./binding')
const ChainedBatch = require('./chained-batch')
const Iterator = require('./iterator')

function LevelDOWN (location) {
  if (!(this instanceof LevelDOWN)) {
    return new LevelDOWN(location)
  }

  if (typeof location !== 'string') {
    throw new Error('constructor requires a location string argument')
  }

  AbstractLevelDOWN.call(this)

  this.location = location
  this.context = binding.db_init()
}

util.inherits(LevelDOWN, AbstractLevelDOWN)

LevelDOWN.prototype._validateOpenConnection = function (funcName) {
  if (this.status !== 'open') {
    // Prevent segfault
    throw new Error(`Connection is closed. Cannot call ${funcName}() before open()`);
  }
}

LevelDOWN.prototype._open = function (options, callback) {
  binding.db_open(this.context, this.location, options, callback)
}

LevelDOWN.prototype._close = function (callback) {
  binding.db_close(this.context, callback)
}

LevelDOWN.prototype._serializeKey = function (key) {
  return Buffer.isBuffer(key) ? key : String(key)
}

LevelDOWN.prototype._serializeValue = function (value) {
  return Buffer.isBuffer(value) ? value : String(value)
}

LevelDOWN.prototype._put = function (key, value, options, callback) {
  this._validateOpenConnection('put');
  binding.db_put(this.context, key, value, options, callback);
}

LevelDOWN.prototype._get = function (key, options, callback) {
  this._validateOpenConnection('get');
  binding.db_get(this.context, key, options, callback);
}

LevelDOWN.prototype._del = function (key, options, callback) {
  this._validateOpenConnection('del');
  binding.db_del(this.context, key, options, callback);
}

LevelDOWN.prototype._chainedBatch = function () {
  this._validateOpenConnection('chainedBatch');
  return new ChainedBatch(this)
}

LevelDOWN.prototype._batch = function (operations, options, callback) {
  this._validateOpenConnection('batch');
  binding.batch_do(this.context, operations, options, callback);
}

LevelDOWN.prototype.approximateSize = function (start, end, callback) {
  this._validateOpenConnection('approximateSize');
  if (start == null ||
      end == null ||
      typeof start === 'function' ||
      typeof end === 'function') {
    throw new Error('approximateSize() requires valid `start` and `end` arguments')
  }

  if (typeof callback !== 'function') {
    throw new Error('approximateSize() requires a callback argument')
  }

  start = this._serializeKey(start)
  end = this._serializeKey(end)

  binding.db_approximate_size(this.context, start, end, callback)
}

LevelDOWN.prototype.compactRange = function (start, end, callback) {
  this._validateOpenConnection('compactRange');
  if (start == null ||
      end == null ||
      typeof start === 'function' ||
      typeof end === 'function') {
    throw new Error('compactRange() requires valid `start` and `end` arguments')
  }

  if (typeof callback !== 'function') {
    throw new Error('compactRange() requires a callback argument')
  }

  start = this._serializeKey(start)
  end = this._serializeKey(end)

  binding.db_compact_range(this.context, start, end, callback)
}

LevelDOWN.prototype.getProperty = function (property) {
  this._validateOpenConnection('getProperty');
  if (typeof property !== 'string') {
    throw new Error('getProperty() requires a valid `property` argument');
  }

  return binding.db_get_property(this.context, property);
}

LevelDOWN.prototype._iterator = function (options) {
  this._validateOpenConnection('iterator');
  return new Iterator(this, options)
}

LevelDOWN.destroy = function (location, callback) {
  if (arguments.length < 2) {
    throw new Error('destroy() requires `location` and `callback` arguments')
  }
  if (typeof location !== 'string') {
    throw new Error('destroy() requires a location string argument')
  }
  if (typeof callback !== 'function') {
    throw new Error('destroy() requires a callback function argument')
  }

  binding.destroy_db(location, callback)
}

LevelDOWN.repair = function (location, callback) {
  if (arguments.length < 2) {
    throw new Error('repair() requires `location` and `callback` arguments')
  }
  if (typeof location !== 'string') {
    throw new Error('repair() requires a location string argument')
  }
  if (typeof callback !== 'function') {
    throw new Error('repair() requires a callback function argument')
  }

  binding.repair_db(location, callback)
}

LevelDOWN.replicate = function (src, dst, backup, callback) {
  if (arguments.length < 4) {
    throw new Error('replicate() requires `src`, `dst`, `backup` and `callback` arguments')
  }
  if (typeof src !== 'string') {
    throw new Error('replicate() requires a src string argument')
  }
  if (typeof dst !== 'string') {
    throw new Error('replicate() requires a dst string argument')
  }
  if (typeof backup !== 'string') {
    throw new Error('replicate() requires a backup string argument')
  }
  if (typeof callback !== 'function') {
    throw new Error('replicate() requires a callback function argument')
  }

  binding.replicate_db(src, dst, backup, callback)
}

module.exports = LevelDOWN.default = LevelDOWN
