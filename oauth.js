describe('OAuth1.0',function(){
  var OAuth = require('OAuth');

  it('tests trends Twitter API v1.1',function(done){
    var oauth = new OAuth.OAuth(
		"https://api.twitter.com/oauth/request_token",
		"https://api.twitter.com/oauth/access_token",
		"dNdLYtnu14xuQ3WzznCkA",
		"S4rSTyLvny1nTGxGuCpXoJcQQvFM7HX62GdbGdN7w",
		"1.0A",
		null,
		"HMAC-SHA1"
    );
    oauth.get(
      'https://api.twitter.com/1.1/trends/place.json?id=23424977',
      '5791-dS61gPttOou1nwvDS1m2XbskaWgWnfFH8Ei69CjGo', //test user token
      '7Ug4lXX0isVaR8lAWvI9Or9a1bnc3kUEtcyxRpNaP1A', //test user secret            
      function (e, data, res){
        if (e) console.error(e);        
        console.log(require('util').inspect(data));
        done();      
      });    
  });
});