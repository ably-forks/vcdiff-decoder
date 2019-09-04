var key = 'HG2KVw.AjZP_A:W7VXUG9yw1-Cza6u';
var channel = 'delta-sample-app';
var url = 'https://realtime.ably.io/event-stream?channels=' + channel + '&v=1.1&key=' + key + '&delta=vcdiff';
var eventSource = new EventSource(url);
var channelDecoder = new DeltaCodec.VcdiffDecoder();

eventSource.onmessage = function(event) {
	var message = JSON.parse(event.data);
	var data = message.data;
	try {
		if (message.extras && message.extras.delta) {
			data = channelDecoder.applyDelta(data, message.id, message.extras.delta.from).asObject();
		} else {
			channelDecoder.setBase(data, message.id);
		}
	} catch(e) {
		/* Delta decoder error */
	}

	/* Process decoded data */
	console.log(data);
};
