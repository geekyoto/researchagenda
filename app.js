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
var Posting = mongoose.model('Posting');
var mongourl = generate_mongo_url(mongo);

console.log('MongoURL: ' + mongourl);

mongoose.connect(mongourl);
	


// Routes
app.get('/', function(req, res){

	// Get the latest 5 postings
	var q = Posting.find().limit(5);
	q.execFind(function(err, posts) {
		console.log(posts);
		
		// If the user is signed in then display a create post form
		if (req.user) {
			res.render('index', { title: 'researchAgenda', posts: posts });
		} else {
			res.render('index_unauth', { title: 'researchAgenda', posts: posts });
		};
	});

});

// Passport Routes for Twitter Authentication
app.get('/auth/twitter', passport.authenticate('twitter'));

// The Twitter Callback
app.get('/auth/twitter/callback', 
	passport.authenticate('twitter', { successRedirect: '/',
									   failureRedirect: '/login' }));

// This function should probably go
// have added links directly to /auth/twitter to the topbar									
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

// View a user profile
app.get('/user/:username', ensureLoggedIn('/auth/twitter'), function(req, res){
	console.log(req.params.username);
	if (req.params.username == req.user.username) {
		// A signed in user profile page
		res.send("Hi, " + req.user.username + " this is your page!");
	} else {
		// Another users page
		res.send("This is " + req.params.username + "'s page.");
	}
});

app.post('/createPost', function(req, res){
	// Submitted a new post
	console.log('Creating Post record in the database');
	new Posting ({
		username: req.user.username,
		title: req.body.title, 
		body: req.body.posting  
	}).save( function (err, posting, count) {
		console.log('Post Record cr` eated');
		console.log('Posting ID: '+posting._id);
		
		res.redirect('/');
	});
});

app.get('/about', function(req, res){
	//Display about page
	res.render('about', { title: 'researchAgenda' }); 
});



app.get('/list', function(req, res){
	// Just a page to list the DB postings
	// Probably wont stay
	
	// Get the latest 5 postings
	var q = Posting.find().limit(5);
	q.execFind(function(err, posts) {
		console.log(posts);
		
		// Now we pass on posts to the template to work through it
		res.render('list', { title: 'researchAgenda', posts: posts});
		
	});
});

app.post('/upvote/:id', function(req, res){
	// Increase the vote for an idea from a user
	//  * Check that the user is signed in
	//  * Increase the +ve vote count for the idea record
	//  * Add entry to the user record that they have voted for the idea
	
});

app.post('/downvotevote/:id', function(req, res){
	// Decrease the vote for an idea from a user
	//  * Check that the user is signed in
	//  * Decrease the +ve vote count for the idea record
	//  * Add entry to the user record that they have removed their vote for the idea
	
});



app.listen(3000);
console.log('Listening on port 3000');