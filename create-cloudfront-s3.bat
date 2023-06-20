@echo off

REM CDKでリソース作成
call cd .\web 
if %errorlevel% neq 0 echo "Failed: cd .\web"

call npm install 
if %errorlevel% neq 0 echo "Failed: npm install"

call npm run build 
if %errorlevel% neq 0 echo "Failed: npm run build"

call cd ..\cdk
if %errorlevel% neq 0 echo "Failed: cd ..\cdk"

call npm install
if %errorlevel% neq 0 echo "Failed: npm install"

call cdk deploy
if %errorlevel% neq 0 echo "Failed: cdk deploy"

REM CloudFormationのOutputsを取得
FOR /F "tokens=* USEBACKQ" %%F IN (`aws cloudformation describe-stacks --stack-name SampleCdkStack --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" --output text`) DO SET "BucketName=%%F"
FOR /F "tokens=* USEBACKQ" %%F IN (`aws cloudformation describe-stacks --stack-name SampleCdkStack --query "Stacks[0].Outputs[?OutputKey=='DistributionDomainName'].OutputValue" --output text`) DO SET "DistributionDomainName=%%F"
FOR /F "tokens=* USEBACKQ" %%F IN (`aws cloudformation describe-stacks --stack-name SampleCdkStack --query "Stacks[0].Outputs[?OutputKey=='DistributionID'].OutputValue" --output text`) DO SET "DistributionID=%%F"

REM CloudFormationの Outputsを表示
call echo BucketName=%BucketName%
call echo DistributionDomainName=%DistributionDomainName%

REM S3バケットのWebsiteRoutingRulesを設定
call cd ..\websiteRoutingRules
if %errorlevel% neq 0 echo "Failed: cd ..\websiteRoutingRules"

call node setWebsiteRoutingRules.js %BucketName% %DistributionDomainName%
if %errorlevel% neq 0 echo "Failed: node setWebsiteRoutingRules.js"

REM CloudFrontのキャッシュを削除
call cd ..\
if %errorlevel% neq 0 echo "Failed: cd ..\"

call aws cloudfront create-invalidation --distribution-id %DistributionID% --paths "/*"
if %errorlevel% neq 0 echo "Failed: aws cloudfront create-invalidation"
