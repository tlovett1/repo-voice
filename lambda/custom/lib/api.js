const request = require('request-promise');
const repos = require('../data/repos.json');

module.exports = {};

module.exports.getReposUpdates = function(repoKeys) {
  var promises = [];

  repoKeys.forEach(function(repoKey) {
    var latest = module.exports.getLatestRelease(repoKey);

    promises.push(latest);

    var issues = module.exports.getIssues(repoKey);

    promises.push(issues);

    var pulls = module.exports.getPullRequests(repoKey);

    promises.push(pulls);
  });

 return Promise.all(promises);
};

module.exports.getRepoUpdates = function(repoKey) {
  var promises = [];

  var latest = module.exports.getLatestRelease(repoKey);

  promises.push(latest);

  var issues = module.exports.getIssues(repoKey);

  promises.push(issues);

  var pulls = module.exports.getPullRequests(repoKey);

  promises.push(pulls);

 return Promise.all(promises);
};

module.exports.getPullRequests = function(repoKey) {
  var repo = repos[repoKey];

  return new Promise(function(resolve, reject) {
    request({
      uri: 'https://api.github.com/repos/' + repo.owner + '/' + repo.name + '/pulls',
      json: true,
      headers: {
        'user-agent': 'GitHub Alexa'
      }
    }).then(function(json) {
      console.log('pr done');

      resolve({
        type: 'pull_requests',
        repoKey: repoKey,
        result: json
      });
    }).catch(function(err) {
      console.log(err.statusCode);

      reject();
    });
  });
};

module.exports.getLatestRelease = function(repoKey) {
  var repo = repos[repoKey];

  return new Promise(function(resolve, reject) {
    console.log('https://api.github.com/repos/' + repo.owner + '/' + repo.name + '/releases/latest');
    request({
      uri: 'https://api.github.com/repos/' + repo.owner + '/' + repo.name + '/releases/latest',
      json: true,
      headers: {
        'user-agent': 'GitHub Alexa'
      }
    }).then(function(json) {
      console.log('latest release done');

      resolve({
        type: 'latest_release',
        repoKey: repoKey,
        result: json
      });
    }).catch(function(err) {
      console.log(err.statusCode);

      reject();
    });
  });
};

module.exports.getIssues = function(repoKey) {
  var repo = repos[repoKey];

  return new Promise(function(resolve, reject) {
    request({
      uri: 'https://api.github.com/repos/' + repo.owner + '/' + repo.name + '/issues',
      json: true,
      headers: {
        'user-agent': 'GitHub Alexa'
      }
    }).then(function(json) {
      console.log('issue done');

      resolve({
        type: 'issues',
        repoKey: repoKey,
        result: json
      });
    }).catch(function(err) {
      console.log(err.statusCode);

      reject();
    });
  });
};

