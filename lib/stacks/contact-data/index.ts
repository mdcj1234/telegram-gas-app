import { CfnOutput, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  AttributeType,
  BillingMode,
  StreamViewType,
  Table,
  TableEncryption,
} from "aws-cdk-lib/aws-dynamodb";

import { CONTACT_DATA_STACK } from "../../../config";
import ApplyTags from "../../common/helpers/applyTags";

export class ContactDataStack extends Stack {
  public readonly contactDataTable: Table;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const contactDataTable = new Table(this, `${CONTACT_DATA_STACK}-table`, {
      partitionKey: { name: "user_id", type: AttributeType.STRING },
      sortKey: { name: "phone_number", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      tableName: `${CONTACT_DATA_STACK}-table`,
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
      removalPolicy: RemovalPolicy.RETAIN,
      encryption: TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: false,
    });
    ApplyTags(contactDataTable)
      .basic()
      .description("Telegram contact data table");

    new CfnOutput(this, `expo-${CONTACT_DATA_STACK}-table`, {
      value: contactDataTable.tableArn,
      exportName: `expo-${CONTACT_DATA_STACK}-table`,
    });

    this.contactDataTable = contactDataTable;
  }
}
