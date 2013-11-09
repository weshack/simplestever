
var Dropbox = require('dropbox');
var https = require('https');


exports.parseDocs = function (blog){

	var client_info = JSON.parse(fs.readFileSync('./cred/client.json').toString());
	var obj = {
		key: client_info.key,
		secret: client_info.secret,
		uid: blog.adminID
	};

	var client = new Dropbox.Client(obj);
	var changedFiles;
	db.admins.findOne({uid: blog.adminID}, function(error, data){
		client.delta(data.cursor, function(err, changesPulled){
			changedFiles = changesPulled.changes;
			db.admins.update({uid: blog.adminID}, {$set: {cursor:changesPulled.cursorTag}},
				function(err2, updated){
					if (err2)
						console.log(err2)
					else
						console.log("cursor updated")
				});

		});

	});

	console.log(changedFiles);

	var download = function(url, dest, cb) {
        var file = fs.createWriteStream(dest);
        var request = https.get(url, function(response) {
                response.pipe(file);
                file.on('finish', function() {
                        file.close();
                        cb();
                });
        });
	
	for (var i = 0: i < changedFiles.length; i++){

            client.makeUrl(changedFiles[i].path, {'download': true}, function(err, data) {
                        if(err) {
                                console.log(err);
                            } else {
                                download(data.url, './' + fileName, function() {
                                        console.log(fileName + ' downloaded');
                                });
                            }
                });



	}
}