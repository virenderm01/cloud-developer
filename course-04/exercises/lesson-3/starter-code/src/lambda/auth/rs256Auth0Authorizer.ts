
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'

const cert= `-----BEGIN CERTIFICATE-----
MIIDBzCCAe+gAwIBAgIJCn1jc3Ad1jpOMA0GCSqGSIb3DQEBCwUAMCExHzAdBgNV
BAMTFnNtYXJ0c2hvcHBlci5hdXRoMC5jb20wHhcNMTgwNjAxMDcwMzQxWhcNMzIw
MjA4MDcwMzQxWjAhMR8wHQYDVQQDExZzbWFydHNob3BwZXIuYXV0aDAuY29tMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3sv9rvM7mz9Fbv53zvgDXUhZ
DaTPtyO3hEnSpHC9mB/MWHqGvr+qnxYdPcsqzBiernwKZKTWSg3Jktg3hh95+U2H
MKgClv3VM+1bp8nMF01OUNpHsqSyQ5tpLj5MkfA0n4UqIS4rBSCMK3iBOQjI/h7g
xOpXML7I2RnfQMCatwApzGdAr7tkm9PPYBANap5Rt4jV65mJz6/Va0DlkI7lJqnq
GRp9wPnsnI5p3c73WNbUCFVdqIA/mvcwme8YaIelCMC32l8wGnbfwAwZo05qcf4/
ITz6jNxRRx61spmkUw/5asB/tXLIwEGi9Bdi3oEarLAm825vTYq0oqiRP8CBmwID
AQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBRhKDRxZwAd5om+vxyM
ppzmHMjnNTAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAJty2j0q
gviZg7+WHSHsFRFzhxJRvCVFvbe6UViBLCFgVYaOXfUgDijQVpz0LSeDbZ+QGKPW
DkHxK1IsoV6/rSohL3FIyHjMwp0Qnm2I6Lz/l33GGUzEUGb5hnGYP9DUXo317Ef4
PXEX5jFz9gMpRQqJMtGCIX2OW+aXH5TrA3CSKy89gbPPZjzthGQxEASYmGJZuAkK
43jzg6ydjSFc2DJoCnCiKaSCJP8aPxrXAWn0/tlPK8VD+r0SBc4Rnx+B/j7Xu1dq
1HHOY3usLkviLMRjvA4Pj99xMrtg2ySbXFdeIFQPczBuvJ0H3O3WXKVk0Y+EkHB9
LPSpgxp+AHn/MnQ=
-----END CERTIFICATE-----`

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try{
      const decodedToken = verifyToken(event.authorizationToken);
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

function verifyToken(authHeader:string): JwtToken{

    if(!authHeader){
        throw new Error('No authorizatin header')
    }

    if(!authHeader.toLocaleLowerCase().startsWith('bearer ')){
        throw new Error('Invalid authorization header');
    }

    const split = authHeader.split(' ');

    const token = split[1];
    return verify(
        token,           // Token from an HTTP header to validate
        cert,            // A certificate copied from Auth0 website
        { algorithms: ['RS256'] } // We need to specify that we use the RS256 algorithm
    ) as JwtToken
}
