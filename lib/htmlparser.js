var htmlparser = require("htmlparser");
var sys = require("sys");
var fs = require("fs");

var rawHtml = fs.readFileSync('W13.html');

// var pattern = new RegExp("</BODY>", "m");
// sys.puts(pattern.exec(rawHtml.toString()));




var handler = new htmlparser.DefaultHandler(function(error, dom){
	if (error)
		console.log("Error creating handler");
	else{
		console.log("Handler created");
	}
});

var parser = new htmlparser.Parser(handler);
parser.parseComplete(rawHtml);
var body = ((handler.dom)[2].children)[3].children;
sys.puts(sys.inspect(body, false, null));

