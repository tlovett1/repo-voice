const repos = require('./lambda/custom/data/repos.json');
const model = require('./models/en-US.json');
const request = require('request-promise');
const fs = require('fs');
const _ = require('lodash');

console.log('Updating repos...');

var numPages = 5;

var pagePromises = [];

for (var page = 1; page <= numPages; page++) {
  var promise = new Promise(function(resolve, reject) {
    request({
      uri: 'https://api.github.com/search/repositories?q=javascript&sort=stars&per_page=100&page=' + page,
      json: true,
      headers: {
        'user-agent': 'GitHub Alexa'
      }
    }).then(function(json) {
      resolve(json);
    }).catch(function(err) {
      console.log(err.statusCode);

      reject();
    });
  });

  pagePromises.push(promise);
}

Promise.all(pagePromises).then(function(results) {
  console.log('Repos retrieved');

  var slotsByKey = {};

  results.forEach(function(json) {
    json.items.forEach(function(repo) {
      var name = repo.name.toLowerCase();

      if (!repos[name]) {
        repos[name] = {};
      }

      repos[name].owner = repo.owner.login;
      repos[name].name = name;
      repos[name].niceName = name.replace(/(\-|_)/g, ' ');
    });
  });

  for (repoKey in repos) {
    var repo = repos[repoKey];

    slotsByKey[repo.name] = {
      name: {
        value: repo.name
      }
    };

    if (repos[repo.name].synonyms) {
      slotsByKey[repo.name].name.synonyms = repos[repo.name].synonyms;
    }
  }

  fs.writeFile('./lambda/custom/data/repos.json', JSON.stringify(repos, null, 2), 'utf8', function() {
    console.log('Updated repos data.');
  });

  model.interactionModel.languageModel.types[0].values = _.values(slotsByKey);

  fs.writeFile('./models/en-US.json', JSON.stringify(model, null, 2), 'utf8', function() {
    console.log('Updated model.');
  });
});
