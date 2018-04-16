const request = require('request-promise');

module.exports = {};

module.exports.getReposUpdates = function(repos) {
  var promises = [];

  Object.keys(repos).forEach(function(repoKey) {
    var repo = repos[repoKey];

    var latest = module.exports.getLatestRelease(repo.owner, repo.name);

    promises.push(latest);

    var issues = module.exports.getIssues(repo.owner, repo.name);

    promises.push(issues);

    var pulls = module.exports.getPullRequests(repo.owner, repo.name);

    promises.push(pulls);
  });

 return Promise.all(promises);
};

module.exports.getRepoUpdates = function(owner, name) {
  var promises = [];

  var latest = module.exports.getLatestRelease(owner, name);

  promises.push(latest);

  var issues = module.exports.getIssues(owner, name);

  promises.push(issues);

  var pulls = module.exports.getPullRequests(owner, name);

  promises.push(pulls);

 return Promise.all(promises);
};

module.exports.getPullRequests = function(owner, name) {
  return new Promise(function(resolve, reject) {
    request({
      uri: 'https://api.github.com/repos/' + owner + '/' + name + '/pulls',
      json: true,
      headers: {
        'user-agent': 'GitHub Alexa'
      }
    }).then(function(json) {
      console.log('pr done');

      resolve({
        type: 'pull_requests',
        owner: owner,
        name: name,
        result: json
      });
    }).catch(function(err) {
      console.log(err.statusCode);

      reject();
    });
  });
};

module.exports.getLatestRelease = function(owner, name) {
  return new Promise(function(resolve, reject) {
    request({
      uri: 'https://api.github.com/repos/' + owner + '/' + name + '/releases/latest',
      json: true,
      headers: {
        'user-agent': 'GitHub Alexa'
      }
    }).then(function(json) {
      console.log('latest release done');

      resolve({
        type: 'latest_release',
        owner: owner,
        name: name,
        result: json
      });
    }).catch(function(err) {
      console.log(err.statusCode);

      reject();
    });
  });
};

module.exports.getIssues = function(owner, name) {
  return new Promise(function(resolve, reject) {
    request({
      uri: 'https://api.github.com/repos/' + owner + '/' + name + '/issues',
      json: true,
      headers: {
        'user-agent': 'GitHub Alexa'
      }
    }).then(function(json) {
      console.log('issue done');

      resolve({
        type: 'issues',
        owner: owner,
        name: name,
        result: json
      });
    }).catch(function(err) {
      console.log(err.statusCode);

      reject();
    });
  });
};

