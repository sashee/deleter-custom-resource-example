import {Stack, aws_iam, aws_appsync, aws_logs, RemovalPolicy, custom_resources} from "aws-cdk-lib";
import path from "path";
import {fileURLToPath} from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class DeleterCustomResourceStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

		/*
		const logsRole = new aws_iam.Role(this, "LogsRole", {
			assumedBy: new aws_iam.ServicePrincipal("appsync.amazonaws.com"),
		});
		logsRole.addToPolicy(new aws_iam.PolicyStatement({
			effect: aws_iam.Effect.ALLOW,
			resources: ["arn:aws:logs:*:*:*"],
			actions: [
				"logs:CreateLogStream",
				"logs:PutLogEvents",
			],
		}));
		*/

		const api = new aws_appsync.GraphqlApi(this, "Api", {
			name: "test-api",
			definition: {
				schema: aws_appsync.SchemaFile.fromAsset(path.join(__dirname, "schema.graphql")),
			},
			authorizationConfig: {
				defaultAuthorization: {
					authorizationType: aws_appsync.AuthorizationType.IAM,
				}
			},
			logConfig: {
				//role: logsRole,
				fieldLogLevel: "ALL",
			},
		});
		/*
		api.logGroup.addMetricFilter("metric1", {
			filterPattern: {
				logPatternString: "ERROR",
			},
			metricName: "test",
			metricNamespace: "test",
		})
		*/
		const logGroupRemover = new custom_resources.AwsCustomResource(this, 'AssociateVPCWithHostedZone', {
			onCreate: {
				service: "@aws-sdk/client-cloudwatch-logs",
				action: "DeleteLogGroupCommand",
				parameters: {
					logGroupName: `/aws/appsync/apis/${api.apiId}`,
				},
				physicalResourceId: custom_resources.PhysicalResourceId.of(`/aws/appsync/apis/${api.apiId}`),
				ignoreErrorCodesMatching: "ResourceNotFoundException",
			},
			policy: custom_resources.AwsCustomResourcePolicy.fromSdkCalls({
				resources: custom_resources.AwsCustomResourcePolicy.ANY_RESOURCE,
			}),
		});
		const logs = new aws_logs.LogGroup(this, "AppSyncLogGroup", {
			logGroupName: `/aws/appsync/apis/${api.apiId}`,
			retention: aws_logs.RetentionDays.TWO_WEEKS,
			removalPolicy: RemovalPolicy.DESTROY,
		});
		logs.node.addDependency(logGroupRemover);
		/*
		logs.addMetricFilter("metric1", {
			filterPattern: {
				logPatternString: "ERROR",
			},
			metricName: "test",
			metricNamespace: "test",
		})
		*/
  }
}

