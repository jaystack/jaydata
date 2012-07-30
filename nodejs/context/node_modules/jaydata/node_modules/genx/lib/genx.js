var EventEmitter = require('events').EventEmitter,
    genx         = require('../build/Release/genx');
genx.Writer.prototype.__proto__ = EventEmitter.prototype;

module.exports = genx;
