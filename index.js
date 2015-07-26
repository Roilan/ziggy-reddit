var request = require('reqwest');

module.exports = function(ziggy) {
  var url = 'http://www.reddit.com'
  var frontPageUrl = url + '/.json';

  function getJSON(type, amount, callback, subreddit, query) {
    var currUrl;

    if (type === 'frontpage') {
      currUrl = frontPageUrl;
    } else if (type === 'sub') {
      currUrl = url + '/r/' + subreddit + '/search.json?q=' + query + '&restrict_sr=on';
    } else {
      return;
    }

    request({
      url: currUrl,
      method: 'GET',
      success: function(resp) {
        var count = 0;
        var respChildren = resp.data.children;

        respChildren.forEach(function(child) {
          var title = child.data.title;
          var permalink = url + child.data.permalink;
          count++;

          if (count > amount) return;

          callback(title + ' - ' + permalink);
        });
      },
      error: function(resp) {
        callback('error');
      }
    });
  }

  function init(user, channel, text) {
    var textArr = text.split(' ');
    var command = textArr.shift();
    var username = user.nick;

    function say(text) {
      return ziggy.say(channel, text);
    }

    function pmUser(text) {
      return ziggy.say(username, text);
    }

    if (text.indexOf('!reddit help') >= 0) {
      return displayHelp();
    }

    if (text.indexOf('!reddit frontpage') >= 0) {
      var amount = textArr[2];

      checkAmount(amount);
      amount = amount || 2;

      getJSON('frontpage', amount, callback(text));
    }

    if (text.indexOf('!reddit search') >= 0) {
      var subreddit = textArr[1];
      var query = textArr[2];
      var amount = textArr[3];

      checkAmount(amount);
      amount = amount || 2;

      getJSON('sub', amount, callback(text), subreddit, query); 1
    }

    function callback(text) {
      return function() {
        say(text);
      }
    }

    function checkAmount(amount) {
      if (amount > 25) return say('requesting too many :(');
    }

    function displayHelp() {
      say('!reddit frontpage # to see front page urls - ex: !reddit frontpage 2');
      say('!reddit search subreddit - ex: !reddit search webdev ziggy');
    }
  }


  ziggy.on('message', init);
}