#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";

import { PurchaseDataStack } from "../lib/stacks/purchase-data";
import { ContactDataStack } from "../lib/stacks/contact-data";
import { MessageHandlerStack } from "../lib/stacks/message-handler";
import { NotificationHandlerStack } from "../lib/stacks/notification-handler";
import { NotificationStack } from "../lib/stacks/notification";
import { UserDataStack } from "../lib/stacks/user-data";
import { InfraArtifactsStack } from "../lib/stacks/infra-artifacts";
import { ApiGatewayStack } from "../lib/stacks/api-gateway";

import {
  AWSAccount,
  AWSRegion,
  PURCHASE_DATA_STACK,
  CONTACT_DATA_STACK,
  MESSAGE_HANDLER_STACK,
  NOTIFICATION_HANDLER_STACK,
  INFRA_ARTIFACTS_STACK,
  API_GATEWAY_STACK,
  USER_DATA_STACK,
  NOTIFICATION_STACK,
} from "../config";

const app = new cdk.App();

const env = { account: AWSAccount, region: AWSRegion };

const infraArtifactsStack = new InfraArtifactsStack(
  app,
  INFRA_ARTIFACTS_STACK,
  {
    env,
    stackName: INFRA_ARTIFACTS_STACK,
    terminationProtection: true,
  }
);

const userDataStack = new UserDataStack(app, USER_DATA_STACK, {
  env,
  stackName: USER_DATA_STACK,
  terminationProtection: true,
});

const purchaseDataStack = new PurchaseDataStack(app, PURCHASE_DATA_STACK, {
  env,
  stackName: PURCHASE_DATA_STACK,
  terminationProtection: true,
});

const contactDataStack = new ContactDataStack(app, CONTACT_DATA_STACK, {
  env,
  stackName: CONTACT_DATA_STACK,
  terminationProtection: true,
});

const messageHandlerStack = new MessageHandlerStack(
  app,
  MESSAGE_HANDLER_STACK,
  {
    env,
    stackName: MESSAGE_HANDLER_STACK,
    terminationProtection: true,
    purchaseDataTable: purchaseDataStack.purchaseDataTable,
    contactDataTable: contactDataStack.contactDataTable,
    userDataTable: userDataStack.userDataTable,
    artifactBucket: infraArtifactsStack.artifactBucket,
  }
);

const notificationHandlerStack = new NotificationHandlerStack(
  app,
  NOTIFICATION_HANDLER_STACK,
  {
    env,
    stackName: NOTIFICATION_HANDLER_STACK,
    terminationProtection: true,
    purchaseDataTable: purchaseDataStack.purchaseDataTable,
    contactDataTable: contactDataStack.contactDataTable,
    userDataTable: userDataStack.userDataTable,
    artifactBucket: infraArtifactsStack.artifactBucket,
  }
);

new ApiGatewayStack(app, API_GATEWAY_STACK, {
  env,
  stackName: API_GATEWAY_STACK,
  terminationProtection: true,
  lambdaMessageHandler: messageHandlerStack.lambdaMessageHandler,
});

new NotificationStack(app, NOTIFICATION_STACK, {
  env,
  stackName: NOTIFICATION_STACK,
  terminationProtection: true,
  lambdaNotificationHandler: notificationHandlerStack.lambdaNotificationHandler,
});
