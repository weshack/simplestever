var fs = require('fs');
var $ = require('jquery');

var parseHtml = function(filename){

    html = fs.readFileSync(filename).toString();
    var body = $($($.parseHTML(html)).find('BODY')).html();
    return body;
}

module.exports=parseHtml;





