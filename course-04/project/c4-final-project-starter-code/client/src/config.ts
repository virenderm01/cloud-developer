// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'lymmtj3fg0'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-2.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'smartshopper.auth0.com',            // Auth0 domain
  clientId: 'EmR64n08LcAALt8KG6qzz7aTN8eXS079',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
