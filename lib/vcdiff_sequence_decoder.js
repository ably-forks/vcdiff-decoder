'use strict';

var vcdiffDecoder = require('./vcdiff_decoder');
var utf8 = require('@protobufjs/utf8');
var base64 = require('@protobufjs/base64');

function VcdiffSequenceDecoder(initialValue) {
	initialize.call(this, initialValue);
}

VcdiffSequenceDecoder.prototype.decodeToUint8Array = function(delta) {
	var deltaAsUint8Array = undefined;
	if (typeof delta === 'string') {
		deltaAsUint8Array = new Uint8Array(base64.length(delta));
		base64.decode(delta, deltaAsUint8Array, 0);
	} else {
		deltaAsUint8Array = delta;
	}
	var decoded = vcdiffDecoder.decodeSync(deltaAsUint8Array, this.dictionary);
	this.dictionary = decoded;
	return decoded;
};

VcdiffSequenceDecoder.prototype.decodeToUtf8String = function(delta) {
	var decoded = this.decodeToUint8Array(delta);
	return utf8.read(decoded, 0, decoded.length);
};

VcdiffSequenceDecoder.prototype.decodeToObject = function(delta) {
	var decoded = this.decodeToUtf8String(delta);
	return JSON.parse(decoded);
};

VcdiffSequenceDecoder.prototype.reinitialize = function(newInitialValue) {
	initialize.call(this, newInitialValue);
};

function initialize(initialValue) {
	if (isUint8Array(initialValue)) {
		this.dictionary = initialValue;
	} else if (typeof initialValue === 'string') {
		this.dictionary = utf8Encode(initialValue);
	} else {
		this.dictionary = utf8Encode(JSON.stringify(initialValue));
	}
}

function isUint8Array(object) {
	return object !== null && object !== undefined && object.constructor === Uint8Array;
}

function utf8Encode(str) {
	var result = new Uint8Array(utf8.length(str));
	utf8.write(str, result, 0);
	return result;
}

module.exports = VcdiffSequenceDecoder;
