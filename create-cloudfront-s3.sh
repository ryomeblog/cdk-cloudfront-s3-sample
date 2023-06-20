#!/bin/sh

# CDKでリソース作成
cd ./web && npm install && npm run build
cd ../cdk && npm install && cdk deploy

# CloudFormationのOutputsを取得
BucketName=$(aws cloudformation describe-stacks --stack-name SampleCdkStack --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" --output text)
DistributionDomainName=$(aws cloudformation describe-stacks --stack-name SampleCdkStack --query "Stacks[0].Outputs[?OutputKey=='DistributionDomainName'].OutputValue" --output text)
DistributionID=$(aws cloudformation describe-stacks --stack-name SampleCdkStack --query "Stacks[0].Outputs[?OutputKey=='DistributionID'].OutputValue" --output text)

# CloudFormationのOutputsを表示
echo "BucketName=$BucketName"
echo "DistributionDomainName=$DistributionDomainName"

# S3バケットのWebsiteRoutingRulesを設定
cd ../websiteRoutingRules
node setWebsiteRoutingRules.js $BucketName $DistributionDomainName

# CloudFrontのキャッシュを削除
aws cloudfront create-invalidation --distribution-id $DistributionID --paths "/*"