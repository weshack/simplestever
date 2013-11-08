var parseHtml = function(filename){
    var fs = require('fs');
    var $ = require('jquery');

    html = fs.readFileSync(filename).toString();
    var body = $($($.parseHTML(html)).find('BODY')).html();
    return body;
}

module.exports=parseHtml;





