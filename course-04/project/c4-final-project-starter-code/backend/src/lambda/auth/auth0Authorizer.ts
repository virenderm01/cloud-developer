import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { createLogger } from '../../utils/logger'

import Axios from 'axios'
import { JwtToken } from '../../auth/JwtToken'
import { verify } from 'jsonwebtoken'

var Rasha = require('rasha'); // RSA support

const logger = createLogger('auth')
const jwksUrl = 'https://smartshopper.auth0.com/.well-known/jwks.json'

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set




export const handler = async (  event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  //logger.info('>>> Authorizing a user', event.authorizationToken)
  console.log('>>> Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    console.log('<<< User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
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
  } catch (e) {
    logger.error('User not authorized', { error: e.message })
    console.log(e);
    return {
      principalId: 'user',
      policyDocument: {
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

async function verifyToken(authHeader: string): Promise<JwtToken> {
  

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/

 
    const token = getToken(authHeader)
    console.log("--- token is ", token);
    console.log(token)
    
    const response = await Axios.get(jwksUrl);
    logger.info("response from axios ", response);
    console.log(response);
    var signingKey = response.data.keys[0];
    if(!signingKey){
      throw new Error("Invalid token");
    }
    
    return  verifyWithJwk(token,signingKey) 
  
}

function verifyWithJwk(jwt, jwk): JwtToken {
  var pem;

  if ('RSA' === jwk.kty) {
    pem = Rasha.exportSync({ jwk: jwk });
  } else {
    throw new Error("Expected RSA key but got '" + jwk.kty + "'");
  }

  return verify(jwt, pem) as JwtToken;
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
