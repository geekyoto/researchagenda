var mongoose = require('mongoose');

var researchSchema = new mongoose.Schema({
	
});
mongoose.model('Research', researchSchema);

var peopleSchema = new mongoose.Schema({
	username: String,
	last_sign_in: Date
});

var postingSchema = new mongoose.Schema({
	username: String,
	title: String,
	body: String
});

var commentsSchema = new mongoose.Schema({
	username: String,
	idea_id: String,
	comment_text: String
});

mongoose.model('Person', peopleSchema);
mongoose.model('Posting', postingSchema);
mongoose.model('Comment', commentSchema);