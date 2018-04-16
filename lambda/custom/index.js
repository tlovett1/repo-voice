const Alexa = require('alexa-sdk');
const repos = require('./data/repos.json');
const request = require('request-promise');
const api = require('./lib/api');
const util = require('./lib/util');
const _ = require('lodash');

exports.handler = function(event, context) {
  const alexa = Alexa.handler(event, context);
  alexa.dynamoDBTableName = 'github-voice';
  alexa.registerHandlers(handlers);
  alexa.execute();
};

const handlers = {
  'LaunchRequest': function() {
    this.response.speak("Welcome to GitHub. Say give me updates on node or update me on my favorites.");
    this.emit(':responseReady');
  },

  'RepoUpdates': function() {
    var self = this;

    var repoKey = this.event.request.intent.slots.repo_name.value;
    var repo = repos[repoKey];

    if (!repo) {
      this.response.speak("Sorry, I haven't heard of that repo.");
      this.emit(':responseReady');
      return;
    }

    var speech = 'Here are the updates on ' + repoKey + '. ';

    var updates = api.getRepoUpdates(repo.owner, repo.name);

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
    }

    this.emit(':responseReady');
  },

  'AddFavorite': function() {
    var repoKey = this.event.request.intent.slots.repo_name.value;
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
    var repoKey = this.event.request.intent.slots.repo_name.value;
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

  'FavoriteUpdates': function() {
    var self = this;

    var favoriteUpdates = api.getReposUpdates(_.values(repos));
    var repoData = {};

    var speech = 'Here are the updates on your favorite repos. ';

    favoriteUpdates.then(function(results) {
      results.forEach(function(result) {
        repos[result.owner + '/' + result.name][result.type] = result.result
      });

      for (repoKey in repos) {
        var repo = repos[repoKey];

        speech += util.formatUpdateSpeech(repo);
      }

      self.response.speak(speech);
      self.emit(':responseReady');
    });
  },

  'AMAZON.StopIntent': function() {
    this.response.speak('Bye');
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
