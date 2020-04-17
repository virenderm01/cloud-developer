import {CustomAuthorizerEvent, CustomAuthorizerHandler, CustomAuthorizerResult} from 'aws-lambda';
import 'source-map-support/register'
import {verify} from 'jsonwebtoken'
import {JwtToken} from '../../auth/JwtToken'
import * as AWS from 'aws-sdk';

const secretId = process.env.AUTH_0_SECRET_ID
const secretField = process.env.AUTH_0_SECRET_FIELD

const client = new AWS.SecretsManager();

//Cache secret in case lambda is not recreated
let cachedSecret: string=undefined;

export const handler: CustomAuthorizerHandler = async(event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {

    try{
        const decodedToken = await verifyToken(event.authorizationToken);
        console.log('User was authorized.');

        return {
            principalId: decodedToken.sub,
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Allow',
                        Resource: '*'
                    }
                ]
            }
        }
    }catch(e){
        console.log('User was not authorized',e.message);

        return {
            principalId: 'user',
            policyDocument:{
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Deny',
                        Resource: '*'
                    }
                ]
            }
        }
    }
}


async function verifyToken(authHeader: string): Promise<JwtToken>{
    if(!authHeader){
        throw new Error('No authorizatin header')
    }

    if(!authHeader.toLocaleLowerCase().startsWith('bearer ')){
        throw new Error('Invalid authorization header');
    }

    const split = authHeader.split(' ');

    const token = split[1];

    const secretObject = await getSecret();
    const secret = secretObject(secretField);
    return verify(token,secret) as JwtToken
}

async function getSecret(){
    if(cachedSecret) return cachedSecret

    const data = await client.getSecretValue({ SecretId: secretId }).promise();
               
    cachedSecret = data.SecretString

    return JSON.parse(cachedSecret);
}
