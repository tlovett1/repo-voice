module.exports = {};

module.exports.formatUpdateSpeech = function(repo) {
  speech = ' The latest release for ' + repo.niceName + ' is ' + repo.latest_release.tag_name + '. ';

  var totalPrsOpened = 0;

  repo.pull_requests.forEach(function(pr) {
    var lastUpdated = new Date(pr.created_at);
    var yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));

    if (lastUpdated > yesterday) {
      totalPrsOpened++;
    }
  });

  speech += ' ' + totalPrsOpened + ' pull requests have been opened in the last 24 hours. ';

  var totalIssuesOpened = 0;

  repo.issues.forEach(function(issue) {
    var lastUpdated = new Date(issue.created_at);
    var yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));

    if (lastUpdated > yesterday) {
      totalIssuesOpened++;
    }
  });

  return speech;
};
