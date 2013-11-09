/*
 * GET dropbox authentication page.
 */
var Dropbox = require('dropbox');
var fs = require('fs');
var $ = require('jquery');

exports.authenticate = function(req, res) {

	var client = new Dropbox.Client({
		key: "4ly1p21210im5m6",
		secret: "h5crlsw5bmsa1ff"
	});

	client.authDriver(new Dropbox.AuthDriver.NodeServer(8191));
	client.authenticate(function(error, client) {
		if (error) {
			// Replace with a call to your own error-handling code.
			//
			// Don't forget to return from the callback, so you don't execute the code
			// that assumes everything went well.
			return showError(error);
		}
		var option = {
			key: client._oauth._id,
			secret: client._oauth._secret,
			token: client._oauth._token,
			uid: client._uid
		}

		console.log(JSON.stringify(option));
		fs.writeFile("option.json",JSON.stringify(option),function(error){
			if(error)
				console.log(error)
		});
	});
};

exports.login = function(req, res){
	var optStr = fs.readFileSync('option.json').toString();

	var option = $.parseJSON(optStr);


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
			console.log("huh?");
	}
};