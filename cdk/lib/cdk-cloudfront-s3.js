// AWS CDKのライブラリをインポートします。
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';

// SampleCdkStackという新しいCDKスタックを作成します。
export class SampleCdkStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // S3バケットを作成します。
    // このバケットは公開読み取りアクセスが許可され、index.htmlとerror.htmlをデフォルトのドキュメントとしています。
    // バケットは、スタックが削除されるときにも削除されます（removalPolicy: cdk.RemovalPolicy.DESTROY）。
    const bucket = new s3.Bucket(this, 'SampleBucket', {
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'error.html',
      publicReadAccess: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // S3バケットに対するIAMポリシーステートメントを作成します。
    // このステートメントは、全てのIAMユーザーがバケット内の全てのオブジェクトを取得することを許可します（'s3:GetObject'）。
    const policyStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['s3:GetObject'],
      principals: [new iam.AnyPrincipal()],
      resources: [bucket.arnForObjects('*')],
    });

    // 上記で作成したポリシーステートメントをS3バケットのリソースポリシーに追加します。
    bucket.addToResourcePolicy(policyStatement);

    // バケットにウェブサイトのファイルをデプロイします。
    // '../web/build'の位置にあるファイルがデプロイの対象となります。
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('../web/build')],
      destinationBucket: bucket,
    });

    // CloudFrontディストリビューションを作成します。
    // ディストリビューションのOrigin（配信元）として、上記で作成したS3バケットを指定します。
    const distribution = new cloudfront.Distribution(this, 'SampleDistribution', {
      defaultBehavior: { origin: new origins.S3Origin(bucket) },
    });

    // CloudFormationの出力としてCloudFrontのURLを指定します。
    // これにより、デプロイ後にこのURLを簡単に取得できます。
    new cdk.CfnOutput(this, 'CloudFrontURL', { value: `https://${distribution.distributionDomainName}` });
    new cdk.CfnOutput(this, 'DistributionDomainName', { value: distribution.distributionDomainName });
    // CloudFormationの出力としてCloudFrontのディストリビューションIDを指定します。
    new cdk.CfnOutput(this, 'DistributionID', { value: distribution.distributionId });
    // CloudFormationの出力としてS3バケット名を指定します。
    new cdk.CfnOutput(this, 'BucketName', { value: bucket.bucketName });
  }
}
