Moved to BitBucket [https://bitbucket.org/jexoio/atlassian-marketplace-aws-lambda/src/master/](https://bitbucket.org/jexoio/atlassian-marketplace-aws-lambda/src/master/)
# atlassian-marketplace-aws-lambda
AWS Lambda function to pull license information from [Atlassian Marketplace](https://marketplace.atlassian.com) and send to [ProfitWell.com](https://ProfitWell.com) &amp; [Segment.com](https://Segment.com)

> NOTE: The function was built to service Cloud Subscriptions, hasn't been tested for Server and may not play well due to differences in licensing states.

> NOTE 2: The current version of the script uses Segment service to handle profiles and events and ProfitWell service to handle revenue insights. Slack is used just for error notifications but there are ready-made functions to send notifications about license lifecycle if Segment is not used. There is also a UserList service that can beconnected but currently not in use in the example.

## Current Event Handlers
 - New Trials
 - New Transactions
 - Cancelled & Expired Licenses
 - Churned Paying Customers

## Requirements
 - AWS Lambda running Node.js 12.x
 - AWS DynamoDB table
 - Slack app
 - GitHub Actions
 - Segment.com account (optional)
 - ProfitWell.com account (optional)
 - UserList.com account (optional)

## Setup
 - Create an AWS Lambda function
 - Set the function Runtime to Node.js 12.x
 - Set the function Handler as **index.handler**
 - Add a CloudWatch Event trigger - **rate(1 hour)**
 - Create a DynamoDB table with Primary key - **key** and link it as a destination to the Lambda function. (tutorial: [http://zonov.me/building-an-amazon-lambda-function-to-write-to-the-dynamodb/](http://zonov.me/building-an-amazon-lambda-function-to-write-to-the-dynamodb/))
 - Enable CloudWatch Logs as a function destination
 - Set Environment Variables (see section bellow)
 - Clone the repo
 - Set GitHub Secrets to be used with GitHub Actions script for deployment (see section bellow)

## AWS Lambda Environment Variables
 - AWS_DEPLOY_REGION  - AWS Region where the DynamoDB table is registered
 - EVENTS_TABLE - AWS DynamoDB table name
 - VENDOR_ID - Atlassian Marketplace Vendor ID
 - MP_AUTH_PASS - Atlassian Marketplace Basic Auth Password
 - MP_AUTH_USER - Atlassian Marketplace Basic Auth User
 - PROFITWELL_AUTH - ProfitWell API Token (optional)
 - SLACK_HOOK_PATH - Slack App Hook Path
 - USERLIST_AUTH - UserList API Token (optional)
 - SEGMENT_WRITE_KEY - Segment Write Key (optional)

## GitHub Secrets
 - AWS_REGION - AWS Region where the Lambda function is registered
 - AWS_LAMBDA_FUNCTION_NAME - AWS Lambda function name
 - AWS_ACCESS_KEY_ID - AWS Access Key ID
 - AWS_SECRET_ACCESS_KEY - AWS Secret Key

## Deploying changes to AWS Lambda function
There is a GitHub Actions script in the repo. This action listens to new GitHub Releases being published and triggers the script to zip the lambda files and uploads the zip file to your Lambda function, replacing the previous files. If you practice a different deployment process you can remove the GitHub Actions script or you can update the .yml file to modify the trigger to be merges to master or commits etc.
Location of the script: `.github/workflows/main.yml`
For more information checkout [GitHub Actions Documentation](https://help.github.com/en/actions)
