import { CfnOutput, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

import { USER_DATA_STACK } from "../../../config";
import ApplyTags from "../../common/helpers/applyTags";
import {
  AttributeType,
  BillingMode,
  StreamViewType,
  Table,
  TableEncryption,
} from "aws-cdk-lib/aws-dynamodb";

export class UserDataStack extends Stack {
  public readonly userDataTable: Table;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const userDataTable = new Table(this, `${USER_DATA_STACK}-table`, {
      partitionKey: { name: "user_id", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      tableName: `${USER_DATA_STACK}-table`,
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
      removalPolicy: RemovalPolicy.DESTROY,
      encryption: TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: true,
    });
    ApplyTags(userDataTable).basic().description("User data table");

    new CfnOutput(this, `expo-${USER_DATA_STACK}-table`, {
      value: userDataTable.tableArn,
      exportName: `expo-${USER_DATA_STACK}-table`,
    });

    this.userDataTable = userDataTable;
  }
}
