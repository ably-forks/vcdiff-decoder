var mqtt = require('mqtt');
var encoding = require('text-encoding');

var VcdiffSequenceDecoder = require('../../lib/vcdiff_sequence_decoder');

var options = {
	keepalive: 30,
	username: 'HG2KVw.AjZP_A',
	password: 'W7VXUG9yw1-Cza6u',
	port: 8883
};
var client = mqtt.connect('mqtts:mqtt.ably.io', options);
var channelName = 'delta-sample-app';
client.on('connect', function () {
	client.subscribe('[?delta=vcdiff]' + channelName);

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

var decoder = new encoding.TextDecoder();
var vcdiffDecoder = undefined;
client.on('message', function (topic, payload) {
	var message = decoder.decode(payload);
	var data;
	if (VcdiffSequenceDecoder.isDelta(message)) {
		data = vcdiffDecoder.decodeToObject(message);
	} else {
		if (vcdiffDecoder) {
			vcdiffDecoder.reinitialize(message);
		} else {
			vcdiffDecoder = new VcdiffSequenceDecoder(message);
		}
		data = JSON.parse(message);
	}
	
	// Process message
	console.log(data);
});

function publish(message) {
	client.publish(channelName, JSON.stringify(message), { qos: 0 }, function(err) {
		if(err) {
			console.log(err);
		}
	});
}
