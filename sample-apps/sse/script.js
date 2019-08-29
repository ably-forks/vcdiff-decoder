var key = 'HG2KVw.AjZP_A:W7VXUG9yw1-Cza6u';
var channel = 'delta-sample-app';
var url = 'https://realtime.ably.io/event-stream?channels=' + channel + '&v=1.1&key=' + key + '&delta=vcdiff';
var eventSource = new EventSource(url);
var vcdiffDecoder = undefined;

eventSource.onmessage = function(event) {
	var message = JSON.parse(event.data);
	var data = message.data;
	if (message.extras && message.extras.delta && message.extras.delta.format === 'vcdiff') {
		data = vcdiffDecoder.decodeToObject(message.data, message.id, message.extras.delta.from);
	} else if (vcdiffDecoder) {
		vcdiffDecoder.reinitialize(message.data, message.id);
	} else {
		vcdiffDecoder = new vcdiff.VcdiffSequenceDecoder(message.data, message.id);
	}

	// Process message
	console.log(data);
};
