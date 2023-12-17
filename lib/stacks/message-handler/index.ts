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

import { MESSAGE_HANDLER_STACK } from "../../../config";
import { TELEGRAM_BOT_TOKEN, SECRET_TOKEN } from "../../../config";
import ApplyTags from "../../common/helpers/applyTags";

export interface MessageHandlerStackProps extends StackProps {
  purchaseDataTable: Table;
  contactDataTable: Table;
  userDataTable: Table;
  artifactBucket: Bucket;
}

export class MessageHandlerStack extends Stack {
  public readonly lambdaMessageHandler: LambdaFunction;
  constructor(scope: Construct, id: string, props: MessageHandlerStackProps) {
    super(scope, id, props);

    const lambdaMessageHandlerRole = new Role(
      this,
      `${MESSAGE_HANDLER_STACK}-role`,
      {
        roleName: `${MESSAGE_HANDLER_STACK}-role`,
        assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaBasicExecutionRole"
          ),
        ],
      }
    );

    props.purchaseDataTable.grantReadWriteData(lambdaMessageHandlerRole);
    props.contactDataTable.grantReadWriteData(lambdaMessageHandlerRole);
    props.userDataTable.grantReadWriteData(lambdaMessageHandlerRole);

    ApplyTags(lambdaMessageHandlerRole)
      .basic()
      .description("Role for the lambda that handles telegram messages");

    const lambdaMessageHandler = new LambdaFunction(
      this,
      `${MESSAGE_HANDLER_STACK}-lambda`,
      {
        functionName: `${MESSAGE_HANDLER_STACK}-lambda`,
        runtime: Runtime.NODEJS_16_X,
        handler: "index.handler",
        role: lambdaMessageHandlerRole,
        timeout: Duration.seconds(10),
        code: Code.fromBucket(
          props.artifactBucket,
          `${MESSAGE_HANDLER_STACK}-lambda.zip`
        ),
        environment: {
          PURCHASE_DATA_TABLE: `${props.purchaseDataTable.tableName}`,
          CONTACT_DATA_TABLE: `${props.contactDataTable.tableName}`,
          USER_DATA_TABLE: `${props.userDataTable.tableName}`,
          TELEGRAM_BOT_TOKEN: `${TELEGRAM_BOT_TOKEN}`,
          SECRET_TOKEN: `${SECRET_TOKEN}`,
        },
        logRetention: RetentionDays.THREE_MONTHS,
      }
    );

    ApplyTags(lambdaMessageHandler)
      .basic()
      .description("Lambda that handles telegram messages");

    new CfnOutput(this, `expo-${MESSAGE_HANDLER_STACK}-lambda`, {
      value: lambdaMessageHandler.functionArn,
      exportName: `expo-${MESSAGE_HANDLER_STACK}-lambda`,
    });

    this.lambdaMessageHandler = lambdaMessageHandler;
  }
}
