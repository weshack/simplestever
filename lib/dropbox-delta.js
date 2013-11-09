var Dropbox = require('dropbox');


var client = new Dropbox.Client({
	key: "4ly1p21210im5m6",
	secret: "h5crlsw5bmsa1ff"
});

client.authDriver(new Dropbox.AuthDriver.NodeServer(8191));

client.delta(function(error, changes){
	if(error){
		console.log(error);
	}
	else{

		console.log(changes);

	}
});

