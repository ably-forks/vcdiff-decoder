var mqtt = require('mqtt');
var encoding = require('text-encoding');
var DeltaCodec = require('../../lib');

var options = {
	keepalive: 30,
	username: 'HG2KVw.AjZP_A',
	password: 'W7VXUG9yw1-Cza6u',
	port: 8883
};
var client = mqtt.connect('mqtts:mqtt.ably.io', options);
var channelName = 'delta-sample-app';
var textDecoder = new encoding.TextDecoder();
var channelDecoder = new DeltaCodec.VcdiffDecoder();
client.on('message', function (topic, payload) {
	var message = textDecoder.decode(payload);
	var data = message;
	try {
		if (DeltaCodec.VcdiffDecoder.isDelta(message)) {
			data = channelDecoder.applyDelta(message).asUtf8String();
		} else {
			channelDecoder.setBase(message);
		}
		data = JSON.parse(data);
	} catch(e) {
		/* Delta decoder error */
	}
	
	/* Process decoded data */
	console.log(data);
});

client.on('connect', function () {
	client.subscribe('[?delta=vcdiff]' + channelName);

	/* Publisher */
	var data = {
		foo: 'bar',
		count: 1,
		status: 'active'
	};
	publish(data);
	data.count++;
	publish(data);
	data.status = 'inactive';
	publish(data);
});

function publish(message) {
	client.publish(channelName, JSON.stringify(message), { qos: 0 }, function(err) {
		if(err) {
			console.log(err);
		}
	});
}
