const AWS = require('aws-sdk');

const EVENTS_TABLE = process.env.EVENTS_TABLE;
const AWS_DEPLOY_REGION = process.env.AWS_DEPLOY_REGION;
const dynamoDb = new AWS.DynamoDB.DocumentClient({
    api_version: '2012-08-10',
    region: AWS_DEPLOY_REGION
});

module.exports.postEventDB = async ({key, value}) => {
  const params = {
    TableName: EVENTS_TABLE,
    Item: {
        key,
        value
    }
  };

  try {
    const data = await dynamoDb.put(params).promise();
    return data;
  } catch (error) {
    console.error('ERROR: Cannot putItem to DynamoDB!', error);
  }
};

module.exports.fetchEventDB = async ({key}) => {
  const params = {
    TableName: EVENTS_TABLE,
    Key: {
      key
    }
  };

  try {
    const data = await dynamoDb.get(params).promise();
    return data;
  } catch (error) {
    console.error('ERROR: Cannot getItem from DynamoDB!', error);
  }
};
