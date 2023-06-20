const AWS = require('aws-sdk');
const s3 = new AWS.S3();

// コマンドライン引数からバケット名とCloudFrontのドメイン名を取得します。
// process.argv[0]はnode、process.argv[1]はスクリプトファイルのパスなので、
// 実際の引数はprocess.argv[2]以降になります。
const bucketName = process.argv[2];
const cloudfrontDomainName = process.argv[3];

const params = {
  Bucket: bucketName, 
  WebsiteConfiguration: {
    ErrorDocument: {
      Key: 'error.html'
    },
    IndexDocument: {
      Suffix: 'index.html'
    },
    RoutingRules: [
      {
        Redirect: {
          Protocol: 'https',
          ReplaceKeyPrefixWith: '#!/',
          HostName: cloudfrontDomainName
        },
        Condition: {
          HttpErrorCodeReturnedEquals: '404'
        }
      },
      {
        Redirect: {
          Protocol: 'https',
          ReplaceKeyPrefixWith: '#!/',
          HostName: cloudfrontDomainName
        },
        Condition: {
          HttpErrorCodeReturnedEquals: '403'
        }
      }
    ]
  }
};

s3.putBucketWebsite(params, function(err, data) {
  if (err) console.log(err, err.stack); 
  else     console.log(data);
});
