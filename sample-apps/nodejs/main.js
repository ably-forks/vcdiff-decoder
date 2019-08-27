var Ably = require('ably');
var VcdiffSequenceDecoder = require('../../lib/vcdiff_sequence_decoder');

var client = new Ably.Realtime('HG2KVw.AjZP_A:W7VXUG9yw1-Cza6u');
client.connection.on('connected', function() {
	var channel = client.channels.get('[?delta=vcdiff]delta-sample-app');
	var vcdiffDecoder = undefined;
	/* Optional */
	var lastMessage = undefined;
	/* Optional End */
	channel.subscribe(function(message) {
		var data = message.data;
		if (message.extras && message.extras.delta && message.extras.delta.format === 'vcdiff') {
			/* Optional */
			if(!lastMessage) {
				console.log('Delta message decode failed - delta message received as first message');
				return;
			}
			if(message.extras.delta.from !== lastMessage.id) {
				console.log('Delta message decode failed - previous message not received');
				return;
			}
			/* Optional End */
			data = vcdiffDecoder.decodeToUtf8String(message.data);
		} else if (vcdiffDecoder) {
			vcdiffDecoder.reinitialize(message.data);
		} else {
			vcdiffDecoder = new VcdiffSequenceDecoder(message.data);
		}
		
		/* Optional */
		lastMessage = message;
		/* Optional End */

		// Process message
		console.log(data);
	});
	
	var data = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
	channel.publish('data', data);
	data += ' Donec quis tellus eu lorem scelerisque rhoncus.';
	channel.publish('data', data);
	data += ' Maecenas odio purus, efficitur in dolor vel, accumsan eleifend tellus.';
	channel.publish('data', data);
});
