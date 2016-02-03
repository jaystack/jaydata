import mock$data from '../core.js';
import $data from 'jaydata/core';
import { expect } from 'chai';

var exports = module.exports = {};

exports.equal = function(actual, expected, msg) {
	it(msg, () => {
		expect(actual).to.equal(expected);
	});
};

exports.deepEqual = function(actual, expected, msg) {
	it(msg, () => {
		expect(actual).to.deep.equal(expected);
	});
};

exports.notEqual = function(actual, expected, msg) {
	it(msg, () => {
		expect(actual).to.not.equal(expected);
	});
};

exports.ok = function(actual, msg) {
	it(msg, () => {
		expect(actual !== undefined).to.equal(true);
	});
};

exports.test = function(testText, count, next) {
	describe(testText, next);
};

exports.stop = function(int) {};
exports.start = function(int) {};