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
var parse_doc = require('./lib/parseDoc');
var db_prefs = {
  debug: true,
  port: 3000,
  databaseUrl: "127.0.0.1:27017/simplestever",
  collections: ['admins', 'blogs']
}
var db = require('mongojs').connect(db_prefs.databaseUrl, db_prefs.collections);
var mongo = require('mongodb-wrapper');
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
app.use('/stylesheets', express.static(path.join(__dirname, 'public/stylesheets/')));
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

app.get('/authenticate', dropbox_oauth.authenticate);
app.get('/login', dropbox_oauth.checkLoggedIn);

app.get('/:user/:title/', function(req, res) {
  db.blogs.findOne({blogName:decodeURIComponent(req.body.title)}, function(err, blog) {

    if(err || !blog) {
      console.log(err);
    } else {
      parse_doc.parseDocs(blog);
      res.render('blog.ejs', {url: blog.url});
    }
  });
});

app.get('/:user/', function(req, res) {

db.blogs.findOne({blogName:req.params.user}, function(err, blog) {
    if(err || !blog) {
      console.log(err);
    } else {
      parse_doc.parseDocs(blog);
      res.render('list.ejs', {posts: blog.posts});
       
        
    }
  });

 /* db.blogs.findOne({blogName:req.body.user}, function(err, blog) {
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
  });*/
});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
