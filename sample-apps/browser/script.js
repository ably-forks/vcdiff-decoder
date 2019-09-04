var client = new Ably.Realtime('HG2KVw.AjZP_A:W7VXUG9yw1-Cza6u');
var channel = client.channels.get('[?delta=vcdiff]delta-sample-app');
var channelDecoder = new DeltaCodec.VcdiffDecoder();

channel.subscribe(function(message) {
	var data = message.data;
	try {
		if (message.extras && message.extras.delta) {
			data = channelDecoder.applyDelta(data, message.id, message.extras.delta.from).asObject();
		} else {
			channelDecoder.setBase(data, message.id);
		}
	} catch (e) {
		/* Delta decoder error */
	}
	
	/* Process decoded data */
	console.log(data);
});

/* Publisher */
client.connection.on('connected', function() {
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
