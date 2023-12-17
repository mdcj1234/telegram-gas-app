echo -e "Generating zip for notification-handler"

cd ./code/notification-handler

zip -qr cooking-gas-app-notification-handler-lambda ./*

echo -e "Uploading .zip to s3"

aws s3 mv cooking-gas-app-notification-handler-lambda.zip s3://cooking-gas-app-infra-artifacts-bucket-prod

echo -e "Done!"