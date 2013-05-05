var mongoose = require('mongoose');

var researchSchema = new mongoose.Schema({
	
});
mongoose.model('Research', researchSchema);

var peopleSchema = new mongoose.Schema({
	oauth_token: String,
	oauth_token_scret: String,
	user_id: String,
	screen_name: String
});

mongoose.model('Person', peopleSchema);