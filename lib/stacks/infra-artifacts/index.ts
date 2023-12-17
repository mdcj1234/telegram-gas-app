import { CfnOutput, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
  ObjectOwnership,
} from "aws-cdk-lib/aws-s3";

import {
  InfraBucketID,
  InfraBucketName,
} from "../../../config/stacks/infra-artifacts";

import ApplyTags from "../../common/helpers/applyTags";

export class InfraArtifactsStack extends Stack {
  public readonly artifactBucket: Bucket;
  public readonly transcribedMessageBucket: Bucket;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const artifactBucket = new Bucket(this, InfraBucketID, {
      encryption: BucketEncryption.KMS_MANAGED,
      removalPolicy: RemovalPolicy.RETAIN,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      objectOwnership: ObjectOwnership.BUCKET_OWNER_PREFERRED,
      bucketName: InfraBucketName,
      versioned: true,
    });

    ApplyTags(artifactBucket)
      .basic()
      .description(
        "Bucket for application artifacts like lambda code packages"
      );

    new CfnOutput(this, `expo-${InfraBucketName}-bucket-arn`, {
      value: artifactBucket.bucketArn,
      exportName: `expo-${InfraBucketName}-bucket-arn`,
    });

    this.artifactBucket = artifactBucket;
  }
}
