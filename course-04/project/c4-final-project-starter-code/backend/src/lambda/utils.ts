import { APIGatewayProxyEvent } from "aws-lambda";
import { parseUserId } from "../auth/utils";
import * as AWS from 'aws-sdk';
/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
export function getUserId(event: APIGatewayProxyEvent): string {
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  return parseUserId(jwtToken)
}

const secretClient = new AWS.SecretsManager()

export async function getSecretValue(id, field): Promise<string> {
  const data = await secretClient.getSecretValue({SecretId: id}).promise();
  return  JSON.parse(data.SecretString)[field];
}