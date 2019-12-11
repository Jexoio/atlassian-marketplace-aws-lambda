workflow "Deploy Lambda Function" {
  on = "release"
  types = [
    "published",
  ]
}

action "Upload Simple Lambda" {
  uses = "appleboy/lambda-action@master"
  secrets = [
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_REGION"
  ]
  args = [
    "--function-name", "atlassian-marketplace-license-handler",
    "--source", "index.js",
    "--source", "package.json",
    "--source", "package-lock.json",
    "--source", "node_modules",
    "--source", "services",
  ]
}
