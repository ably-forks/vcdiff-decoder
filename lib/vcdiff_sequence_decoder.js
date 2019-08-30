'use strict';

var utf8 = require('@protobufjs/utf8');
var base64 = require('@protobufjs/base64');
var isBuffer = require('is-buffer');

var vcdiff = require('./vcdiff');
var vcdiffDecoder = require('./vcdiff_decoder');

function VcdiffSequenceDecoder(source, sourceId) {
	initialize.call(this, source, sourceId);
}

VcdiffSequenceDecoder.isDelta = function(data) {
	return vcdiff.hasVCDiffHeader(toUint8Array(data));
};

VcdiffSequenceDecoder.prototype.decodeToUint8Array = function(delta, deltaId, sourceId) {
	if (this.sourceId !== sourceId) {
		throw new Error('The provided sourceId does not match the last preserved sourceId in the sequence');
	}
	if (!isBinaryData(delta)) {
		throw new Error('The provided delta does not represent binary data');
	}
	var deltaAsUint8Array = toUint8Array(delta);
	if (!VcdiffSequenceDecoder.isDelta(deltaAsUint8Array)) {
		throw new Error('The provided delta is not a valid VCDIFF delta');
	}

	var decoded = vcdiffDecoder.decodeSync(deltaAsUint8Array, this.source);
	this.source = decoded;
	this.sourceId = deltaId;
	// Return copy to avoid future delta application failures if the returned array is changed
	return new Uint8Array(decoded);
};

VcdiffSequenceDecoder.prototype.decodeToUtf8String = function(delta, deltaId, sourceId) {
	var decoded = this.decodeToUint8Array(delta, deltaId, sourceId);
	return utf8.read(decoded, 0, decoded.length);
};

VcdiffSequenceDecoder.prototype.decodeToObject = function(delta, deltaId, sourceId) {
	var decoded = this.decodeToUtf8String(delta, deltaId, sourceId);
	return JSON.parse(decoded);
};

VcdiffSequenceDecoder.prototype.reinitialize = function(newSource, newSourceId) {
	initialize.call(this, newSource, newSourceId);
};

function initialize(source, sourceId) {
	if (source === null || source === undefined) {
		throw new Error('VcdiffSequenceDecoder cannot be initialized or reinitialized with null or undefined');
	}

	this.source = toUint8Array(source);
	this.sourceId = sourceId;
}

function isUint8Array(object) {
	return object instanceof Uint8Array;
}

function isArrayBuffer(object) {
	return object instanceof ArrayBuffer;
}

function isBinaryData(data) {
	return isBase64String(data) || isArrayBuffer(data) || isUint8Array(data) || isBuffer(data);
}

function isString(data) {
	return typeof data === 'string';
}

function isBase64String(data) {
	return isString(data) && base64.test(data);
}

function base64Decode(str) {
	var result = new Uint8Array(base64.length(str));
	base64.decode(str, result, 0);
	return result;
}

function utf8Encode(str) {
	var result = new Uint8Array(utf8.length(str));
	utf8.write(str, result, 0);
	return result;
}

function toUint8Array(data) {
	if (isString(data)) {
		return isBase64String(data) ? base64Decode(data) : utf8Encode(data);
	} else if (isArrayBuffer(data)) {
		return new Uint8Array(data);
	} else if (isUint8Array(data) || isBuffer(data)) {
		return data;
	} else {
		return utf8Encode(JSON.stringify(data));
	}
}

module.exports = VcdiffSequenceDecoder;
