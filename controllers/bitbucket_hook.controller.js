module.exports = (req, res, controller) => {

  var actorDisplayName = req.body.actor.display_name;
  var actorAvatarImageLink = req.body.actor.links.avatar.href;

  var typeNameMain;
  var typeNameOperation;
  var type = req.get('x-event-key');

  var typeSplitted = type.split(":");
  switch(typeSplitted[0]) {
      case 'pullrequest':
          typeNameMain = 'Pull request';
          break;
      default:
          typeNameMain = 'Pull request';
  }
  var operationSplitted = typeSplitted[1].split("_");
  var operation = "";
  operationSplitted.forEach(element => {
      operation += element+" ";
  });

  let reviewersString = '';
  let pr;
  let message;

  if (typeSplitted[0] == 'pullrequest') {
    pr = req.body.pullrequest
    let color;
    switch(pr.state) {
      case 'OPEN':
        color = '#2D9EE0'
        break;
      case 'DECLINED':
        color = '#FF0000'
        break;
      case 'MERGED':
        color = '#007a5a'
        break;
      default:
        color = '#2D9EE0'
    }
    pr.reviewers.forEach(element => {
      reviewersString += reviewersString+" "+element.display_name+", ";
    });
    reviewersString = reviewersString.substr(0, reviewersString.length-2);
    message = {
      channel: 'oeYyFJ63GQbxCnhaC',
      text: '',
      attachments: [
        {
          "author_icon": pr.author.links.avatar.href,
          "author_name": pr.author.nickname,
          "collapsed": true,
          "color": color,
          "fields": [
            {
              "short": true,
              "title": "Repository",
              "value": (req.body.repository.name || '')
            },
            {
              "short": true,
              "title": "Branch",
              "value": (pr.source.branch.name || '') + ' > ' +
                (pr.destination.branch.name || '')
            },
            {
              "short": true,
              "title": "Commit",
              "value": "[Link](" + pr.source.commit.links.html.href + ") " + pr.title
            }
          ],
          "text": pr.title + "\r\n" + pr.summary.raw,
          "title": `${typeNameMain} #${pr.id}: ${pr.state}`,
          "title_link": pr.links.html.href,
          "ts": pr.created_on,
        }
      ]
    }
  } else if (typeSplitted[0] == 'repo') {
    repo = req.body.repository
    build = req.body.commit_status

    if (!build || !build.commit.message.includes('Merged in')) {
      return
    }

    let color
    switch(build.state) {
      case 'OPEN':
        color = '#2D9EE0'
        break;
      case 'STOPPED':
        color = '#FF0000'
        break;
      case 'FAILED':
        color = '#FF0000'
        break;
      case 'SUCCESSFUL':
        color = '#007a5a'
        break;
      default:
        color = '#2D9EE0'
    }
    message = {
      channel: 'oeYyFJ63GQbxCnhaC',
      text: '',
      attachments: [
        {
          "author_icon": (build.commit.author.user.links.avatar.href || ''),
          "author_name": build.commit.author.raw,
          "collapsed": false,
          "color": color,
          "fields": [
            {
              "short": true,
              "title": "Repository",
              "value": (repo.name || '')
            },
            {
              "short": true,
              "title": "Branch",
              "value": (build.refname || '')
            },
            // {
            //   "short": true,
            //   "title": "Commit",
            //   "value": "[Link](" + pr.source.commit.links.html.href + ") " + pr.title
            // }
          ],
          "text": build.commit.message,
          "title": `${build.name}: ${build.state}`,
          "title_link": build.url,
          "ts": build.created_on,
        }
      ]
    }
  }

  controller.spawn({}, function(bot) {
      bot.connected = true
      if (message) {
        bot.say(
            message
          , function(response) {
            console.log('response', response);
          }
        );
      }
    });

    // respond to FB that the webhook has been received.
    res.send('ok');
}