var express = require('express'),
	http = require('http'),
	path = require('path');
	
var mongoose = require('mongoose');	
var db = require('./db');

var app = express();
app.use( express.cookieParser() );
app.use( express.session( { secret: 'whatever' } ) );

var mongo;

var OAuth = require('oauth').OAuth;

var oa = new OAuth(
	"https://api.twitter.com/oauth/request_token",
	"https://api.twitter.com/oauth/access_token",
	"84xeNkpYXgLJiceIEJJlQ",
	"DCFHFJGXdt6LTQNH3p6cy8Kr6g03ASK2RufsLdEvJI",
	"1.0",
	"http://localhost:3000/auth/twitter/callback",
	"HMAC-SHA1"
	);

	app.configure(function(){
	  app.set('port', process.env.VCAP_APP_PORT || 3000);
	  app.set('views', __dirname + '/views');
	  app.set('view engine', 'jade');
	  app.use(express.favicon());
	  app.use(express.logger('dev'));
	  app.use(express.bodyParser());
	  app.use(express.methodOverride());
	  app.use(app.router);
	  app.use(express.static(path.join(__dirname, 'public')));
	});

	app.configure('development', function(){
	  app.use(express.errorHandler());
	  mongo = {
				"hostname":"localhost",
		        "port":27017,
		        "username":"",
		        "password":"",
		        "name":"",
		        "db":"test"
		    };
	//  mongoose.connect('mongodb://localhost/test');
	});

	app.configure('production', function(){
		var env = JSON.parse(process.env.VCAP_SERVICES);
		mongo = env['mongodb-1.8'][0]['credentials'];
	})

	var generate_mongo_url = function(obj){
	    obj.hostname = (obj.hostname || 'localhost');
	    obj.port = (obj.port || 27017);
	    obj.db = (obj.db || 'test');
	    if(obj.username && obj.password){
	        return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
	    }
	    else{
	        return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
	    }
	}


var Person = mongoose.model('Person');
var mongourl = generate_mongo_url(mongo);

console.log('MongoURL: ' + mongourl);

mongoose.connect(mongourl);
	


// Routes
app.get('/', function(req, res){
	//Display the homepage
	res.send("ok, a homepage");
});

app.get('/auth/twitter', function(req, res){
	oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
		if (error) {
			console.log(error);
			res.send("yeah no. didn't work.")
		}
		else {
			req.session.oauth = {};
			req.session.oauth.token = oauth_token;
			console.log('oauth.token: ' + req.session.oauth.token);
			req.session.oauth.token_secret = oauth_token_secret;
			console.log('oauth.token_secret: ' + req.session.oauth.token_secret);
			res.redirect('https://twitter.com/oauth/authenticate?oauth_token='+oauth_token)
	}
	});
});

app.get('/auth/twitter/callback', function(req, res, next){
	if (req.session.oauth) {
		req.session.oauth.verifier = req.query.oauth_verifier;
		var oauth = req.session.oauth;

		oa.getOAuthAccessToken(oauth.token,oauth.token_secret,oauth.verifier, 
		function(error, oauth_access_token, oauth_access_token_secret, results){
			if (error){
				console.log(error);
				res.send("yeah something broke.");
			} else {
				// write into the database
				oauth_access_token = req.session.oauth.access_token;
				oauth_access_token_secret = req.session.oauth.access_token_secret;
				
				// if they are already in the DB, then they do not need a new record
				Person.findOne({oauth_token: oauth_access_token}, function(err, person){
					if (person) {
						// they already exist
					} else {
						new Person({
							oauth_token : oauth_access_token,
							oauth_token_secret : oauth_access_token_secret
						}).save(function(err, person){
							console.log(results);
							res.send("worked. nice one.");
							// This should redirect to the users 'page'				
						});
					}
				});
			}
		}
		);
	} else
		next(new Error("you're not supposed to be here."))
});


app.get('/:username', function(req, res){
	// Display the users page
	
});

app.listen(3000);
console.log('Listening on port 3000');