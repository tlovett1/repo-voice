module.exports = {};

module.exports.formatUpdateSpeech = function(repo) {
  var speech = '';

  if (repo.latest_release !== false) {
    speech += ' The latest release for ' + repo.niceName + ' is ' + repo.latest_release.tag_name + '. ';
  }

  if (repo.pull_requests !== false) {
    var totalPrsOpened = 0;

    repo.pull_requests.forEach(function(pr) {
      var lastUpdated = new Date(pr.created_at);
      var yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));

      if (lastUpdated > yesterday) {
        totalPrsOpened++;
      }
    });

    speech += ' ' + totalPrsOpened + ' pull requests have been opened in the last 24 hours. ';
  }

  if (repo.issues !== false) {
    var totalIssuesOpened = 0;

    repo.issues.forEach(function(issue) {
      var lastUpdated = new Date(issue.created_at);
      var yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));

      if (lastUpdated > yesterday) {
        totalIssuesOpened++;
      }
    });

    speech += ' ' + totalIssuesOpened + ' issues have been created in the last 24 hours. ';
  }

  return speech;
};
