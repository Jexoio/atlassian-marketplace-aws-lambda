const request = require('request-promise-native');
const SK_PATH = 'https://slack.com/api';
const SLACK_HOOK_PATH = process.env.SLACK_HOOK_PATH;

module.exports.sendErrorNotification = async (message) => {
  const text = `:warning: ${message}`
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

module.exports.sendNewTrialNotification = async ({company, app}) => {
  const text = `:tada: ${company} just started a trial for ${app}`
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

module.exports.sendNewTrialNotification = async ({company, app}) => {
  const text = `:tada: ${company} just started a trial for ${app}`
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

module.exports.sendNewClientNotification = async ({company, app}) => {
  const text = `:money_mouth_face: Good news everyone! ${company} trial for ${app} has ended and is now a paying customer.`
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

module.exports.sendCancelledNotification = async ({company, app, status}) => {
  const text = `:weary: Oh, ${company} trial for ${app} is now ${status}.`
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

module.exports.sendChurnedNotification = async ({company, app}) => {
  const text = `:sob: looks like ${company} cancelled their trial of ${app}.`
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
