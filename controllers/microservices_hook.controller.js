module.exports = (req, res, controller) => {
  const baseKibanaEndpoint = process.env.ELASTICSEARCH_ENDPOINT || ''
  let message

  req.body.map(logItem => {
    const logAction = JSON.parse(logItem.action) || {}
    const kibanaStack = logAction['index']['_index'] || ''
    const logSourceMessage = JSON.parse(logItem.source)['@message'] || ''
    const logSourceGroup = JSON.parse(logItem.source)['@log_group'] || ''
    const logSourceOwner = JSON.parse(logItem.source)['@owner'] || ''
    const timestamp = JSON.parse(logItem.source)['@timestamp'] || ''
    const logStream = JSON.parse(logItem.source)['@log_stream'] || ''

    let color

    if (logSourceMessage.includes('.INFO')) {
      color = '#2D9EE0'
    } else if (logSourceMessage.includes('_FAILED')) {
      color = '#CC3300'
    } else if (logSourceMessage.includes('.ERROR')) {
      color = '#FF0000'
    } else {
      color = '#2D9EE0'
    }

    message = {
      channel: 'oeYyFJ63GQbxCnhaC',
      text: '',
      attachments: [
        {
          "author_icon": 'https://d1jnx9ba8s6j9r.cloudfront.net/blog/wp-content/uploads/2018/10/Picture1-7-303x300.png',
          "author_name": 'Microservices Log: ' + logSourceMessage.substring(0, 100) + '...',
          "collapsed": true,
          "color": color,
          "fields": [
            {
              "short": true,
              "title": "Service",
              "value": (logSourceGroup || '')
            },
            {
              "short": true,
              "title": "Kibana stack",
              "value": (kibanaStack || '')
            },
            {
              "short": true,
              "title": "Log stream",
              "value": (logStream || '')
            }
          ],
          "text": logSourceGroup + "\r\n" + logSourceMessage.substring(0, 400),
          "title": `${logSourceGroup} #${logSourceOwner}`,
          "title_link": baseKibanaEndpoint,
          "ts": timestamp,
        }
      ]
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

  })
}