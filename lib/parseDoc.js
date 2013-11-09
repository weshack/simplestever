var Dropbox = require('dropbox');
var https = require('https');
var fs = require('fs');
var htmlparser = require('./htmlparser');
var db_prefs = {
	debug: true,
	port: 3000,
	databaseUrl: "127.0.0.1:27017/simplestever",
	collections: ['admins', 'blogs']
}
var db = require('mongojs').connect(db_prefs.databaseUrl, db_prefs.collections);
var mongo = require('mongodb-wrapper');
exports.parseDocs = function(blog) {

	var client_info = JSON.parse(fs.readFileSync('./cred/client.json').toString());
	var obj = {
		key: client_info.key,
		secret: client_info.secret,
		uid: blog.adminID
	};


	var changedFiles = {};
	console.log(blog)
	db.admins.findOne({
		uid: blog.adminID
	}, function(error, data) {
		if (error || !data) {
			console.log(error);
		} else {
			obj.token = data.token;
			client = new Dropbox.Client(obj);
			client.delta(data.cursor, function(err, changesPulled) {
				if (err || !changesPulled) {
					console.log(err)
				}

				changedFiles = changesPulled.changes;
				db.admins.update({
						uid: blog.adminID
					}, {
						$set: {
							cursor: changesPulled.cursorTag
						}
					},
					function(err2, updated) {
						if (err2) {
							console.log(err2)
						} else {
							console.log("cursor updated")
							//console.log(changedFiles);
							loop();
						}
					});

			});
		}

	});



	var download = function(url, dest, cb) {
		var file = fs.createWriteStream(dest);
		var request = https.get(url, function(response) {
			response.pipe(file);
			file.on('finish', function() {
				file.close();
				cb();
			});
		});
	};
	var loop = function() {
		console.log(changedFiles);
		changedFiles.forEach(function(changedFile) {
			if(changedFile.path.indexOf('/.appdata/') !== -1 || changedFile.path.indexOf('/simplestever') !== 0) {
				return false;
			}
			
			client.makeUrl(changedFile.path, {
				'download': true
			}, function(err, data) {
				if (err) {
					console.log(err);
				} else {
					// ADD TIME LATER!!!!!!!!!!!!!
					//console.log(changedFile);
					var fileName = changedFile.stat.path.split('/');
					fileName = fileName[fileName.length - 1];
					download(data.url, './temp/' + fileName, function() {
						console.log(fileName + ' downloaded');
						var convert = require("./convert");
						convert('./temp/' + fileName, function(path) {
							var htmlFile = path.split('/');
							htmlFile = htmlFile[htmlFile.length - 1];
							var example = htmlparser('./temp/' + htmlFile);

							client.writeFile('/SimplestEver/.appdata/' + htmlFile, example, function(err) {
								// console.log(err);
								// temporary files should be deleted here
								client.makeUrl('/SimplestEver/.appdata/' + htmlFile, {
									'downloadHack': true
								}, function(err, data) {
									if(err) {return false;}
									//console.log(adminID)
									db.blogs.update({adminID: blog.adminID},
									{$push: {posts: {url:data.url,file:htmlFile} } },
									function(err, updated) {
										if(err) {return false;}
										console.log('added to database');
									});
								});
								
								fs.unlink('./temp/' + htmlFile, function(err) {
											if (err) {
												return false;
											}
										});
								fs.unlink('./temp/' + fileName, function(err) {
											if (err) {
												return false;
											}
										});
							});
						});
					});
				}
			});
		});
	}

};