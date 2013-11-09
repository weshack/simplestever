
/*
 * converts files to HTML
 */


var spawn = require("child_process").spawn
exports.convert = function(path, callback){
	var process = spawn('libreoffice',['--headless','-convert-to','html',path]);
	process.on('exit', function(code, signal) {
		console.log("document converted");
		var newPath = path.substring(0, path.lastIndexOf('.')) + '.html';
		callback(newPath);
	});
};

