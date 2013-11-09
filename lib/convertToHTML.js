
/*
 * converts files to HTML
 */

var spawn = require("child_process").spawn
exports.convertToHTML = function(path){
	var process = spawn('libreoffice',['--headless','-convert-to','html',path]);
	console.log("document converted");
	return true;
};

