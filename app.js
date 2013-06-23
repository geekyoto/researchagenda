var express = require('express'),
	http = require('http'),
	path = require('path'),
	ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
	
var mongoose = require('mongoose');	
var db = require('./db');

var app = express();
app.use( express.cookieParser() );
app.use( express.session( { secret: 'whatever' } ) );

var mongo;

// Use Passport
var passport = require('passport'), TwitterStrategy = require('passport-twitter').Strategy;

passport.use(new TwitterStrategy({
	consumerKey: "dNdLYtnu14xuQ3WzznCkA",
	consumerSecret: "S4rSTyLvny1nTGxGuCpXoJcQQvFM7HX62GdbGdN7w",
	callbackURL: "http://127.0.0.1:3000/auth/twitter/callback"
	},
	function(token, tokenSecret, profile, done) {
	  // NOTE: You'll probably want to associate the Twitter profile with a
	  //       user record in your application's DB.
	  var user = profile;
	  console.log(user);
	
	  Person.findOne({username: user.username}, function(err, person){
			if (person) {
				// they already exist
			} else {
				new Person({
					username : user.username
				}).save(function(err, person){
					// Needs to be written as a new account in the DB
			
				});
			}
		});
	
	  return done(null, user);
	}
));

//var OAuth = require('oauth').OAuth;

/* var oa = new OAuth(
	"https://api.twitter.com/oauth/request_token",
	"https://api.twitter.com/oauth/access_token",
	"dNdLYtnu14xuQ3WzznCkA",
	"S4rSTyLvny1nTGxGuCpXoJcQQvFM7HX62GdbGdN7w",
	"1.0A",
	"http://localhost:3000/auth/twitter/callback",
	"HMAC-SHA1"
	);
*/
	app.configure(function(){
	  app.set('port', process.env.VCAP_APP_PORT || 3000);
	  app.set('views', __dirname + '/views');
	  app.set('view engine', 'jade');
	  app.use(express.favicon());	
	  app.use(express.logger('dev'));
	  app.use(express.bodyParser());
	  app.use(express.methodOverride());
	  app.use(passport.initialize());
	  app.use(passport.session());
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
		        "db":"researchagenda"
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

		res.send("Homepage");

});

// Passport Routes for Twitter Authentication
app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/twitter/callback', 
	passport.authenticate('twitter', { successRedirect: '/',
									   failureRedirect: '/login' }));
									
app.get('/login', function(req, res){
	res.send("<a href='/auth/twitter'>Sign In</a>");
})

// Serialize user into session
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// OLd OAuth Code
/***
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
	console.log('Callback called: ');
	if (req.session.oauth) {
		req.session.oauth.verifier = req.query.oauth_verifier;
		var oauth = req.session.oauth;
		console.log('Inside if statement: ');
		oa.getOAuthAccessToken(oauth.token,oauth.token_secret,oauth.verifier, 
		function(error, oauth_access_token, oauth_access_token_secret, results){
			if (error){
				console.log(error);
				res.send("yeah something broke.");
			} else {
				// write into the database
				oauth_access_token = req.session.oauth.access_token;
				oauth_access_token_secret = req.session.oauth.access_token_secret;
				
				req.session.screen_name = 'results.screen_name';
				valid = true;
				
				// if they are already in the DB, then they do not need a new record
				Person.findOne({oauth_token: oauth_access_token}, function(err, person){
					if (person) {
						// they already exist
					} else {
						new Person({
							oauth_token : oauth_access_token,
							oauth_token_secret : oauth_access_token_secret
						//	user_id: results.user_id,
						//	screen_name: results.screen_name
						}).save(function(err, person){
							// Needs to be written as a new account in the DB
							
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
***/

app.get('/:username', ensureLoggedIn('/login'), function(req, res){
	res.send("Greetings " + req.user.username);
});

app.listen(3000);
console.log('Listening on port 3000');