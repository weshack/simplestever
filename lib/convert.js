
/*
 * converts files to HTML
 */


var spawn = require("child_process").spawn
module.exports = function(path, callback){
	var process = spawn('libreoffice',['--headless','-convert-to','html','--outdir',
			'./temp/', path]);
	process.on('exit', function(code, signal) {
		console.log("document converted");
		var newPath = path.substring(0, path.lastIndexOf('.')) + '.html';
		callback(newPath);
	});
};

