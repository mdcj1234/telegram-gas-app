import { LogGroup } from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";

export type LogGroupFactoryType = (
  construct: Construct,
  logGroupName: string,
  logGroupDesc: string
) => LogGroup;
