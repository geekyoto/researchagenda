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

mongoose.model('Person', peopleSchema);
mongoose.model('Posting', postingSchema);