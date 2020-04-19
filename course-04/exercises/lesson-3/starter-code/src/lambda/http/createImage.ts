import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as uuid from 'uuid'
import * as middy from 'middy';
import {cors} from 'middy/middlewares';
import {getUserId} from '../../auth/utils';

const AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS);
const docClient = new XAWS.DynamoDB.DocumentClient()
const s3 = new XAWS.S3({
      signatureVersion: 'v4'
});
const groupsTable = process.env.GROUPS_TABLE
const imagesTable = process.env.IMAGES_TABLE
const bucketName = process.env.IMAGES_S3_BUCKET;
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;
export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Caller event', event)
  const groupId = event.pathParameters.groupId
  const validGroupId = await groupExists(groupId)

  if (!validGroupId) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Group does not exist'
      })
    }
  }

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const imageId = uuid.v4()
  const userId = getUserId(jwtToken)

  const parsedBody = JSON.parse(event.body)
  let dateTime = new Date().toISOString();
  //let newImage = JSON.parse(event.body);
  const newItem = {
    imageId: imageId,
    groupId: groupId,
    timestamp: dateTime,
    imageUrl: `https://${bucketName}.s3.amazonaws.com/${imageId}`,
    userId: userId,
    ...parsedBody
  }

  await docClient.put({
    TableName: imagesTable,
    Item: newItem
  }).promise()

  const url = getUploadUrl(imageId);

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      newItem,
      uploadUrl: url
    })
  }
}
)

async function groupExists(groupId: string) {
  const result = await docClient
    .get({
      TableName: groupsTable,
      Key: {
        id: groupId
      }
    })
    .promise()

  console.log('Get group: ', result)
  return !!result.Item
}

function getUploadUrl(imageId: string){
  return s3.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: imageId,
      Expires: urlExpiration

  });
}

handler.use(
  cors({
    credentials: true
  })

)