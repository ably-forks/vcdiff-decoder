var Ably = require('ably');
var VcdiffSequenceDecoder = require('../../lib/vcdiff_sequence_decoder');

var client = new Ably.Realtime('HG2KVw.AjZP_A:W7VXUG9yw1-Cza6u');
client.connection.on('connected', function() {
	var channel = client.channels.get('[?delta=vcdiff]delta-sample-app');
	var vcdiffDecoder = undefined;

	channel.subscribe(function(message) {
		var data = message.data;
		if (message.extras && message.extras.delta && message.extras.delta.format === 'vcdiff') {
			data = vcdiffDecoder.decodeToObject(message.data, message.id, message.extras.delta.from);
		} else if (vcdiffDecoder) {
			vcdiffDecoder.reinitialize(message.data, message.id);
		} else {
			vcdiffDecoder = new VcdiffSequenceDecoder(message.data, message.id);
		}

		// Process message
		console.log(data);
	});
	
	var data = {
		foo: 'bar',
		count: 1,
		status: 'active'
	};
	channel.publish('data', data);
	data.count++;
	channel.publish('data', data);
	data.status = 'inactive';
	channel.publish('data', data);
});
