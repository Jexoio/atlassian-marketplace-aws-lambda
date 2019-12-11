const request = require('request-promise-native');
const SK_PATH = 'https://slack.com/api';
const SLACK_HOOK_PATH = process.env.SLACK_HOOK_PATH;

module.exports.sendErrorNotification = async (text) => {
  const json = {
    text
  };
  try {
    const response = await request.post({
      url: SLACK_HOOK_PATH,
      json,
      headers: {
        'Content-Type': 'application/json'
      },
    });
    return response;
  }
  catch(error) {
    console.error('ERROR: Cannot send Slack Error Message!', error);
  }
};
