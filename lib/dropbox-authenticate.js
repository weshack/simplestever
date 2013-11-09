/*
 * GET dropbox authentication page.
 */
var Dropbox = require('dropbox');
var fs = require('fs');
var $ = require('jquery');
var db_prefs = {
	debug: true,
	port: 3000,
	databaseUrl: "127.0.0.1:27017/simplestever",
	collections: ['admins', 'blogs']
}
var db = require('mongojs').connect(db_prefs.databaseUrl, db_prefs.collections);
var mongo = require('mongodb-wrapper');

var client_info = JSON.parse(fs.readFileSync('./cred/client.json').toString());
console.log(client_info)


var server = new Dropbox.AuthDriver.NodeServer(8191)



exports.authenticate = function(req, res) {
	var client = new Dropbox.Client({
		key: client_info.key,
		secret: client_info.secret
	});
	client.authDriver(server);

	client.authenticate(function(error, cl) {
		if (error) {
			// Replace with a call to your own error-handling code.
			//
			// Don't forget to return from the callback, so you don't execute the code
			// that assumes everything went well.
			return showError(error);
		}

		// var User = {
		// 	uid: cl._uid,
		// 	token: cl._oauth._token,
		// };

		var pp = cl._oauth._token

		// BLOGNAMES, GET THEM BELOW
		// console.log(User)
		var user;

		db.admins.findOne({
			uid: cl._uid
		}, function(err, data) {
			if (err) {
				console.log(err);
			} else if (data) {
				db.admins.update({
						uid: cl._uid
					}, {
						$set: {
							token: pp
						}
					},
					function(err, updated) {
						if (err || !updated) {
							console.log(err);
						} else {
							console.log("User exists!");
						}
					});
			} else {
				console.log("user does not exist")
				db.admins.save({
					uid: cl._uid,
					token: cl._oauth._token
				}, function(err, saved) {
					if (err || !saved) {
						console.log("new admin not saved!");
						console.log(err);
					} else {
						console.log("successfully saved admin!");
					}
				});
			}
		});
		// console.log(newCheck)
		// // else if user does not exist, create new user, add to users
		// if (newCheck == true) {
		// 	console.log("user does not exist")
		// 	db.admins.save({
		// 		uid: cl._uid,
		// 		token: cl._oauth._token
		// 	}, function(err, saved) {
		// 		if (err || !saved) {
		// 			console.log("new admin not saved!");
		// 			console.log(err);
		// 		} else {
		// 			console.log("successfully saved admin!");
		// 		}
		// 	});
		// }

		// Set the cookie to the uid regardless
		// $.cookie("uid",uid)
	});
	// server.closeBrowser(res)
	// server.closeServer();
	res.redirect("/blog/");
	// });
};



//checkLoggedIn(uid) searches cred/option for the user with the matching uid, and creates
//the dropbox client from that info. This should only be called if the uid was already
//found in cookies, so that uid should always exist in cred/option.
exports.checkLoggedIn = function(req, res, uid) {
	var optStr = fs.readFileSync('cred/option.json').toString();

	var optObj = $.parseJSON(optStr);
	var clientInfo = optObj.client;
	var users = optObj.users;
	var userFound = false;

	for (user in users) {
		if (users.uid == uid) {
			var option = {
				key: clientInfo.key,
				secret: clientInfo.secret,
				token: user.token,
				uid: user.uid
			}
			userFound = true;
			break;
		}
	}

	if (!userFound) {
		console.log("UID not found in options file");
	}

	var client = new Dropbox.Client(option);

	client.getAccountInfo(function(error, accountInfo) {
		if (error) {
			return showError(error); // Something went wrong.
		}

		console.log("Hello, " + accountInfo.name + "!");
	});

}

var showError = function(error) {
	switch (error.status) {
		case Dropbox.ApiError.INVALID_TOKEN:
			// If you're using dropbox.js, the only cause behind this error is that
			// the user token expired.
			// Get the user through the authentication flow again.
			console.log(Dropbox.ApiError.INVALID_TOKEN);
			break;

		case Dropbox.ApiError.NOT_FOUND:
			// The file or folder you tried to access is not in the user's Dropbox.
			// Handling this error is specific to your application.
			console.log(Dropbox.ApiError.NOT_FOUND);
			break;

		case Dropbox.ApiError.OVER_QUOTA:
			// The user is over their Dropbox quota.
			// Tell them their Dropbox is full. Refreshing the page won't help.
			console.log(Dropbox.ApiError.OVER_QUOTA);
			break;

		case Dropbox.ApiError.RATE_LIMITED:
			// Too many API requests. Tell the user to try again later.
			// Long-term, optimize your code to use fewer API calls.
			console.log(Dropbox.ApiError.RATE_LIMITED);
			break;

		case Dropbox.ApiError.NETWORK_ERROR:
			// An error occurred at the XMLHttpRequest layer.
			// Most likely, the user's network connection is down.
			// API calls will not succeed until the user gets back online.
			console.log(Dropbox.ApiError.NETWORK_ERROR);
			break;

		case Dropbox.ApiError.INVALID_PARAM:
		case Dropbox.ApiError.OAUTH_ERROR:
		case Dropbox.ApiError.INVALID_METHOD:
		default:
			// Caused by a bug in dropbox.js, in your application, or in Dropbox.
			// Tell the user an error occurred, ask them to refresh the page.
			console.log(error);
	}
};