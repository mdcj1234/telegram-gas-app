import { CfnOutput, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Function as LambdaFunction } from "aws-cdk-lib/aws-lambda";
import {
  DomainName,
  EndpointType,
  LambdaIntegration,
  LogGroupLogDestination,
  MethodLoggingLevel,
  Model,
  RestApi,
  SecurityPolicy,
} from "aws-cdk-lib/aws-apigateway";
import {
  Certificate,
  CertificateValidation,
} from "aws-cdk-lib/aws-certificatemanager";
import { ARecord, HostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { ApiGatewayDomain } from "aws-cdk-lib/aws-route53-targets";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";

import { API_GATEWAY_STACK } from "../../../config";
import {
  subDomainUrl,
  stageName,
  domainUrl,
  appHostedZode,
} from "../../../config/stacks/api-gateway";
import ApplyTags from "../../common/helpers/applyTags";

export interface ApiGatewayStackProps extends StackProps {
  lambdaMessageHandler: LambdaFunction;
}

export class ApiGatewayStack extends Stack {
  public readonly api: RestApi;

  constructor(scope: Construct, id: string, props: ApiGatewayStackProps) {
    super(scope, id, props);

    const apiAccessLogGroup = new LogGroup(
      this,
      `${API_GATEWAY_STACK}-loggroup`,
      {
        logGroupName: `/api/access`,
        removalPolicy: RemovalPolicy.DESTROY,
        retention: RetentionDays.TWO_MONTHS,
      }
    );

    const api = new RestApi(this, `${API_GATEWAY_STACK}-gateway`, {
      deploy: true,
      deployOptions: {
        accessLogDestination: new LogGroupLogDestination(apiAccessLogGroup),
        stageName,
        loggingLevel: MethodLoggingLevel.INFO,
        metricsEnabled: false,
        tracingEnabled: false,
        throttlingBurstLimit: 20,
        throttlingRateLimit: 10,
      },
      restApiName: API_GATEWAY_STACK,
      description: "Api Gateway for the telegram cooking gas app",
      endpointTypes: [EndpointType.REGIONAL],
      disableExecuteApiEndpoint: false,
    });

    ApplyTags(api)
      .basic()
      .description("Api Gateway for the telegram cooking gas app");

    const hostedZone = HostedZone.fromLookup(this, appHostedZode, {
      domainName: domainUrl,
    });

    const tlsCertificate = new Certificate(
      this,
      `${API_GATEWAY_STACK}-tls-certificate`,
      {
        domainName: `${subDomainUrl}.${domainUrl}`,
        validation: CertificateValidation.fromDns(hostedZone),
      }
    );
    ApplyTags(tlsCertificate)
      .basic()
      .description("Tls certificate for the application");

    const apiDomain = new DomainName(this, `${API_GATEWAY_STACK}-domain`, {
      domainName: `${subDomainUrl}.${domainUrl}`,
      certificate: tlsCertificate,
      securityPolicy: SecurityPolicy.TLS_1_2,
      endpointType: EndpointType.REGIONAL,
    });
    ApplyTags(apiDomain)
      .basic()
      .description("Api Gateway domain for the telegram cooking gas app");

    new ARecord(this, `${API_GATEWAY_STACK}-domain-record`, {
      zone: hostedZone,
      target: RecordTarget.fromAlias(new ApiGatewayDomain(apiDomain)),
      recordName: `${subDomainUrl}.${domainUrl}`,
    });

    apiDomain.addBasePathMapping(api, {
      stage: api.deploymentStage,
    });

    const messageResource = api.root.addResource("message");

    messageResource.addMethod(
      "POST",
      new LambdaIntegration(props.lambdaMessageHandler, {
        proxy: true,
      }),
      {
        apiKeyRequired: false,
        requestParameters: {
          "method.request.header.X-Telegram-Bot-Api-Secret-Token": true,
        },
        methodResponses: [
          {
            statusCode: "200",
            responseModels: { "application/json": Model.EMPTY_MODEL },
          },
        ],
      }
    );

    new CfnOutput(this, `expo-${API_GATEWAY_STACK}-rest-api-id`, {
      value: api.restApiId,
      exportName: `expo-${API_GATEWAY_STACK}-rest-api-id`,
    });

    this.api = api;
  }
}
