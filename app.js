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
var partials = require('express-partials');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.use(partials());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('secret'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(partials());

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//app.get('/', routes.index);

// these are only for template testing
app.get('/', function(req,res) {
  res.render('index.ejs', {layout: false});
});
app.get('/blog', function(req,res) {
  res.render('blog.ejs');
});
app.get('/list', function(req,res) {
  res.render('list.ejs');
});
app.get('/authenticate', dropbox_oauth.authenticate);
app.get('/login', dropbox_oauth.checkLoggedIn);

app.get('/:user/:title', function(req, res) {
  
});

app.get('/:user', function(req, res) {

  db.blogs.findOne({blogName:req.body.user}, function(err, blog) {
    if(err || !blog) {
      console.log(err);
    } else {
      db.admins.findOne({uid: blog.adminID}, function(err, user) {
        if(err || !user) {
          console.log(err);
        } else {
          console.log(user);
            var client = new Dropbox.Client({
              key: "4ly1p21210im5m6",
              secret: "h5crlsw5bmsa1ff",
              token: user.token
            });
          //now other stuff




        }
      });
    }
  });
});



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
