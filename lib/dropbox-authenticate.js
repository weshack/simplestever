/*
 * GET dropbox authentication page.
 */
var Dropbox = require('dropbox');
var fs = require('fs');
var $ = require('jquery');


exports.authenticate = function(req, res) {

	var client_info = JSON.parse(fs.readFileSync('./cred/client.json').toString())
	console.log(client_info)
	var client = new Dropbox.Client({
		key: client_info.key,
		secret: client_info.secret
	});

	client.authDriver(new Dropbox.AuthDriver.NodeServer(8191));
	// client.authDriver(new Dropbox.Drivers.Redirect({
        // rememberUser: true
    // }));
	client.authenticate(function(error, client) {
		if (error) {
			// Replace with a call to your own error-handling code.
			//
			// Don't forget to return from the callback, so you don't execute the code
			// that assumes everything went well.
			return showError(error);
		}

		var User = {
			uid: client._uid,
			token: client._oauth._token,
		};

		// BLOGNAMES, GET THEM BELOW

		var userInfo = JSON.parse(fs.readFileSync('cred/users.json').toString()).users
		console.log(userInfo)
		// If user exists, get user, reset auth token 
		

		// REPLACE WITH MONGO QUERY LATER
		var newCheck = true
		for (i in userInfo){
			if (i.uid == User.uid){
				console.log("user exists")
				i.token = User.token
				var newCheck = false
			} 
		};

		// else if user does not exist, create new user, add to users
		if (newCheck == true) {
			console.log("user does not exist")
			userInfo.push({"uid":User.uid,"token":User.token})
		}

		// Set the cookie to the uid regardless
		// $.cookie("uid",uid)

		var info = {
			users: userInfo
		};

		console.log(JSON.stringify(info));
		fs.writeFile("cred/users.json",JSON.stringify(info),function(error){
			if(error)
				console.log(error)
		});

		window.location.replace("/blogs/")
	});
};



//checkLoggedIn(uid) searches cred/option for the user with the matching uid, and creates
//the dropbox client from that info. This should only be called if the uid was already
//found in cookies, so that uid should always exist in cred/option.
exports.checkLoggedIn = function(req, res, uid){
	var optStr = fs.readFileSync('cred/option.json').toString();

	var optObj = $.parseJSON(optStr);
	var clientInfo = optObj.client;
	var users = optObj.users;
	var userFound = false;

	for (user in users){
		if (users.uid == uid){
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

	if (!userFound){
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