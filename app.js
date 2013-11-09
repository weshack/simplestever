/*
   _____ _                 _           _     ______              
  / ____(_)               | |         | |   |  ____|             
 | (___  _ _ __ ___  _ __ | | ___  ___| |_  | |____   _____ _ __ 
  \___ \| | '_ ` _ \| '_ \| |/ _ \/ __| __| |  __\ \ / / _ \ '__|
  ____) | | | | | | | |_) | |  __/\__ \ |_  | |___\ V /  __/ |   
 |_____/|_|_| |_| |_| .__/|_|\___||___/\__| |______\_/ \___|_|   
                    | |                                          
                    |_|                                          
*/

var express = require('express');
var routes = require('./routes');
var convert = require('./lib/convert');
var http = require('http');
var path = require('path');
var dropbox_oauth = require('./lib/dropbox-authenticate');


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//app.get('/', routes.index);

// these are only for template testing
app.get('/', function(req,res) {
	res.render('index');
});
app.get('/blog/', function(req,res) {
	res.render('blog');
});
app.get('/authenticate', dropbox_oauth.authenticate);
app.get('/login', dropbox_oauth.login);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
