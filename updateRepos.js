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
  var slots = model.interactionModel.languageModel.types[0].values;

  slots.forEach(function(slot) {
    slotsByKey[slot.name.value] = {
      name: {
        value: slot.name.value
      }
    }
  });

  results.forEach(function(json) {
    json.items.forEach(function(repo) {
      repos[repo.name] = {
        owner: repo.owner.login,
        name: repo.name,
        niceName: repo.name.replace(/(\-|_)/g, ' ')
      };

      slotsByKey[repo.name] = {
        name: {
          value: repo.name
        }
      };

    });
  });

  fs.writeFile('./lambda/custom/data/repos.json', JSON.stringify(repos, null, 2), 'utf8', function() {
    console.log('Updated repos data.');
  });

  model.interactionModel.languageModel.types[0].values = _.values(slots);

  fs.writeFile('./models/en-US.json', JSON.stringify(model, null, 2), 'utf8', function() {
    console.log('Updated model.');
  });
});
