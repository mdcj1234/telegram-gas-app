import { CfnOutput, Duration, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import {
  Code,
  Runtime,
  Function as LambdaFunction,
} from "aws-cdk-lib/aws-lambda";
import { RetentionDays } from "aws-cdk-lib/aws-logs";

import { NOTIFICATION_HANDLER_STACK } from "../../../config";
import { TELEGRAM_BOT_TOKEN } from "../../../config";
import ApplyTags from "../../common/helpers/applyTags";

export interface NotificationHandlerStackProps extends StackProps {
  purchaseDataTable: Table;
  contactDataTable: Table;
  userDataTable: Table;
  artifactBucket: Bucket;
}

export class NotificationHandlerStack extends Stack {
  public readonly lambdaNotificationHandler: LambdaFunction;
  constructor(
    scope: Construct,
    id: string,
    props: NotificationHandlerStackProps
  ) {
    super(scope, id, props);

    const lambdaNotificationHandlerRole = new Role(
      this,
      `${NOTIFICATION_HANDLER_STACK}-role`,
      {
        roleName: `${NOTIFICATION_HANDLER_STACK}-role`,
        assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaBasicExecutionRole"
          ),
        ],
      }
    );

    props.purchaseDataTable.grantReadWriteData(lambdaNotificationHandlerRole);
    props.contactDataTable.grantReadWriteData(lambdaNotificationHandlerRole);
    props.userDataTable.grantReadWriteData(lambdaNotificationHandlerRole);

    ApplyTags(lambdaNotificationHandlerRole)
      .basic()
      .description("Role for the lambda that handles telegram notifications");

    const lambdaNotificationHandler = new LambdaFunction(
      this,
      `${NOTIFICATION_HANDLER_STACK}-lambda`,
      {
        functionName: `${NOTIFICATION_HANDLER_STACK}-lambda`,
        runtime: Runtime.NODEJS_16_X,
        handler: "index.handler",
        role: lambdaNotificationHandlerRole,
        timeout: Duration.seconds(10),
        code: Code.fromBucket(
          props.artifactBucket,
          `${NOTIFICATION_HANDLER_STACK}-lambda.zip`
        ),
        environment: {
          PURCHASE_DATA_TABLE: `${props.purchaseDataTable.tableName}`,
          CONTACT_DATA_TABLE: `${props.contactDataTable.tableName}`,
          USER_DATA_TABLE: `${props.userDataTable.tableName}`,
          TELEGRAM_BOT_TOKEN: `${TELEGRAM_BOT_TOKEN}`,
        },
        logRetention: RetentionDays.THREE_MONTHS,
      }
    );

    ApplyTags(lambdaNotificationHandler)
      .basic()
      .description("Lambda that handles telegram notifications");

    new CfnOutput(this, `expo-${NOTIFICATION_HANDLER_STACK}-lambda`, {
      value: lambdaNotificationHandler.functionArn,
      exportName: `expo-${NOTIFICATION_HANDLER_STACK}-lambda`,
    });

    this.lambdaNotificationHandler = lambdaNotificationHandler;
  }
}
