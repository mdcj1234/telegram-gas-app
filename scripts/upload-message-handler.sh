echo -e "Generating zip for message-handler"

cd ./code/message-handler

zip -qr cooking-gas-app-message-handler-lambda ./*

echo -e "Uploading .zip to s3"

aws s3 mv cooking-gas-app-message-handler-lambda.zip s3://cooking-gas-app-infra-artifacts-bucket-prod

echo -e "Done!"