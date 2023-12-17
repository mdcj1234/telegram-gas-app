import { Stack, StackProps } from "aws-cdk-lib";
import { Rule, Schedule } from "aws-cdk-lib/aws-events";
import { Function as LambdaFunction } from "aws-cdk-lib/aws-lambda";
import { LambdaFunction as LambdaFunctionTarget } from "aws-cdk-lib/aws-events-targets";
import { Construct } from "constructs";
import { NOTIFICATION_STACK } from "../../../config";

import ApplyTags from "../../common/helpers/applyTags";

export interface NotificationStackProps extends StackProps {
  lambdaNotificationHandler: LambdaFunction;
}

export class NotificationStack extends Stack {
  public readonly rule: Rule;

  constructor(scope: Construct, id: string, props: NotificationStackProps) {
    super(scope, id, props);

    const rule = new Rule(this, `${NOTIFICATION_STACK}-rule`, {
      enabled: true,
      schedule: Schedule.expression("cron(0 7 ? * MON-SUN *)"),
      targets: [new LambdaFunctionTarget(props.lambdaNotificationHandler)],
      ruleName: `${NOTIFICATION_STACK}-cron-rule`,
      description: "Rule to send notifications",
    });

    ApplyTags(rule).basic().description("Rule to send notifications");

    this.rule = rule;
  }
}
