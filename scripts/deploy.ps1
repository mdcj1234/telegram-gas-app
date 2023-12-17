$AWS_REGION = "us-east-1"
$AWS_ACCOUNT = (aws sts get-caller-identity --query Account --output text)
$CDK_VERSION = (./node_modules/.bin/cdk --version)

$env:AWS_REGION = $AWS_REGION
$env:AWS_ACCOUNT = $AWS_ACCOUNT

$TELEGRAM_BOT_TOKEN = ""
$SECRET_TOKEN = ""
$env:TELEGRAM_BOT_TOKEN = $TELEGRAM_BOT_TOKEN
$env:SECRET_TOKEN = $SECRET_TOKEN

Write-Host "Deploying to AWS Account $AWS_ACCOUNT, Region $AWS_REGION, using AWS CDK $CDK_VERSION"

./node_modules/.bin/cdk bootstrap "aws://$AWS_ACCOUNT/$AWS_REGION"

Write-Host "Select stack"

$stacks = @("infra-artifacts", "user-data", "purchase-data", "contact-data", "message-handler", "notification-handler", "api", "notification-rule")
$index = 1
foreach ($stack in $stacks) {
    Write-Host "$index. $stack"
    $index++
}

$selectedStack = Read-Host "Enter the number corresponding to the stack"

$stackName = "cooking-gas-app-" + $stacks[$selectedStack-1]
Clear-Host

npm run build

./node_modules/.bin/cdk synth $stackName

./node_modules/.bin/cdk diff $stackName

./node_modules/.bin/cdk deploy $stackName