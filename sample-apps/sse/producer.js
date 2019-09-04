var Ably = require('ably');

var client = new Ably.Realtime('HG2KVw.AjZP_A:W7VXUG9yw1-Cza6u');
var channel = client.channels.get('delta-sample-app');
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
