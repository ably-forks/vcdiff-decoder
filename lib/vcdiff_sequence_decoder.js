'use strict';

var utf8 = require('@protobufjs/utf8');
var base64 = require('@protobufjs/base64');

var vcdiffDecoder = require('./vcdiff_decoder');

function VcdiffSequenceDecoder(source, sourceId) {
	initialize.call(this, source, sourceId);
}

VcdiffSequenceDecoder.prototype.decodeToUint8Array = function(delta, deltaId, sourceId) {
	if (this.sourceId !== sourceId) {
		throw new Error('The provided sourceId does not match the last preserved sourceId in the sequence.');
	}

	var deltaAsUint8Array = undefined;
	if (typeof delta === 'string') {
		deltaAsUint8Array = new Uint8Array(base64.length(delta));
		base64.decode(delta, deltaAsUint8Array, 0);
	} else if (isArrayBuffer(delta)) {
		deltaAsUint8Array = new Uint8Array(delta);
	} else {
		deltaAsUint8Array = delta;
	}
	var decoded = vcdiffDecoder.decodeSync(deltaAsUint8Array, this.source);
	this.source = decoded;
	this.sourceId = deltaId;
	return decoded;
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

	if (isUint8Array(source)) {
		this.source = source;
	} else if (typeof source === 'string') {
		this.source = utf8Encode(source);
	} else {
		this.source = utf8Encode(JSON.stringify(source));
	}
	this.sourceId = sourceId;
}

function isUint8Array(object) {
	return object !== null && object !== undefined && object.constructor === Uint8Array;
}

function isArrayBuffer(object) {
	return object !== null && object !== undefined && object.constructor === ArrayBuffer;
}

function utf8Encode(str) {
	var result = new Uint8Array(utf8.length(str));
	utf8.write(str, result, 0);
	return result;
}

module.exports = VcdiffSequenceDecoder;
