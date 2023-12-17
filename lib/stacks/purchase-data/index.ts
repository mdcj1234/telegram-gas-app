import { CfnOutput, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  AttributeType,
  BillingMode,
  StreamViewType,
  Table,
  TableEncryption,
} from "aws-cdk-lib/aws-dynamodb";

import { PURCHASE_DATA_STACK } from "../../../config";
import ApplyTags from "../../common/helpers/applyTags";

export class PurchaseDataStack extends Stack {
  public readonly purchaseDataTable: Table;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const purchaseDataTable = new Table(this, `${PURCHASE_DATA_STACK}-table`, {
      partitionKey: { name: "user_id", type: AttributeType.STRING },
      sortKey: { name: "register_date", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      tableName: `${PURCHASE_DATA_STACK}-table`,
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
      removalPolicy: RemovalPolicy.RETAIN,
      encryption: TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: false,
    });
    ApplyTags(purchaseDataTable)
      .basic()
      .description("Telegram purchase data table");

    new CfnOutput(this, `expo-${PURCHASE_DATA_STACK}-table`, {
      value: purchaseDataTable.tableArn,
      exportName: `expo-${PURCHASE_DATA_STACK}-table`,
    });

    this.purchaseDataTable = purchaseDataTable;
  }
}
