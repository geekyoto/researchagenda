var mongoose = require('mongoose');

var researchSchema = new mongoose.Schema({
	
});
mongoose.model('Research', researchSchema);

var peopleSchema = new mongoose.Schema({
	username: String
});

mongoose.model('Person', peopleSchema);