const Alexa = require('alexa-sdk');
const repos = require('./data/repos.json');
const request = require('request-promise');
const api = require('./lib/api');
const util = require('./lib/util');
const _ = require('lodash');

exports.handler = function(event, context) {
  console.log('Received event: ', JSON.stringify(event, null, 2));

  const alexa = Alexa.handler(event, context);
  alexa.dynamoDBTableName = 'github-voice';
  alexa.registerHandlers(handlers);
  alexa.execute();
};

const handlers = {
  'LaunchRequest': function() {
    this.response.speak("Welcome to GitHub Voice. Say give me updates on node or update me on my favorites.");
    this.emit(':responseReady');
  },

  'RepoUpdates': function() {
    var self = this;

    var repoKey = util.parseSlotValue(this.event.request.intent.slots.repo_name);

    var repo = repos[repoKey];

    if (!repo) {
      this.response.speak("Sorry, I haven't heard of that repo.");
      this.emit(':responseReady');
      return;
    }

    var speech = 'Here are the updates on ' + repoKey + '. ';

    var updates = api.getRepoUpdates(repoKey);

    updates.then(function(results) {
      results.forEach(function(result) {
        repo[result.type] = result.result
      });

      speech += util.formatUpdateSpeech(repo);

      self.response.speak(speech);
      self.emit(':responseReady');
    });
  },

  'GetFavorites': function() {
    if (!this.attributes.favorites) {
      this.response.speak("You currently have no favorites. Tell alexa add favorite to add one.");
      this.emit(':responseReady');
      return;
    }

    var speech = 'Here are your favorites: ';

    Object.keys(this.attributes.favorites).forEach(function(repoKey) {
      speech += ', ' + repoKey;
    });

    this.response.speak(speech);
    this.emit(':responseReady');
  },

  'AddFavorite': function() {
    var repoKey = util.parseSlotValue(this.event.request.intent.slots.repo_name);
    var repo = repos[repoKey];

    if (!repo) {
      this.response.speak("Sorry, I haven't heard of that repo.");
      this.emit(':responseReady');
      return;
    }

    if (!this.attributes.favorites) {
      favorites = {};
    }

    favorites[repoKey] = true;

    this.attributes.favorites = favorites;

    this.response.speak("Favorite has been added.");

    this.emit(':responseReady');
  },

  'RemoveFavorite': function() {
    var repoKey = util.parseSlotValue(this.event.request.intent.slots.repo_name);
    var repo = repos[repoKey];

    if (!this.attributes.favorites) {
      this.response.speak("You currently have no favorites.");
      this.emit(':responseReady');
      return;
    }

    if (!repo) {
      this.response.speak("Sorry, I haven't heard of that repo.");
      this.emit(':responseReady');
      return;
    }

    var favorites = this.attributes.favorites;

    delete favorites[repoKey];

    this.attributes.favorites = favorites;

    this.response.speak("Favorite has been removed.");

    this.emit(':responseReady');
  },

  'RemoveAllFavorites': function() {
    if (!this.attributes.favorites) {
      this.response.speak("You currently have no favorites.");
      this.emit(':responseReady');
      return;
    }

    this.attributes.favorites = {};

    this.response.speak("All favorites have been removed.");

    this.emit(':responseReady');
  },

  'FavoriteUpdates': function() {
    if (!this.attributes.favorites) {
      this.response.speak("You currently have no favorites. Tell Alexa to add a favorite.");
      this.emit(':responseReady');
      return;
    }

    var self = this;

    var favoriteUpdates = api.getReposUpdates(Object.keys(this.attributes.favorites));
    var repoData = {};

    var speech = 'Here are the updates on your favorite repos. ';

    favoriteUpdates.then(function(results) {
      results.forEach(function(result) {
        repos[result.repoKey][result.type] = result.result
      });

      Object.keys(self.attributes.favorites).forEach(function(repoKey) {
        var repo = repos[repoKey];

        speech += util.formatUpdateSpeech(repo);
      });

      self.response.speak(speech);
      self.emit(':responseReady');
    });
  },

  'AMAZON.StopIntent': function() {
    this.response.speak('Bye');
    this.emit(':responseReady');
  },

  'AMAZON.HelpIntent': function() {
    this.response.speak(
      "GitHub Voice let's you get updates on the GitHub repos of your choosing. Say Alexa ask GitHub Voice for updates on my "
      + "favorites. You can easily add and remove favorites. Say Alexa tell GitHub Voice add favorite node. You can also get "
      + "updates for specific repos. Say Alexa ask GitHub Voice for updates on node."
    );
    this.emit(':responseReady');
  },

  'AMAZON.CancelIntent': function() {
    this.response.speak('Bye');
    this.emit(':responseReady');
  },

  'Unhandled': function() {
    this.response.speak("Sorry, I didn't get that.");
    this.emit(':responseReady');
  },

  'SessionEndedRequest': function() {
    console.log('Session ended with reason: ' + this.event.request.reason);
  }
};
