import {Group} from '../models/Group';
import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
const AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS);

export class GroupAccess{
    constructor(
        private readonly docClient:DocumentClient = createDynamoDbClient(),
        private readonly  groupsTable = process.env.GROUPS_TABLE){

    }

    async getAllGroups(): Promise<Group[]>  {
        console.log('Getting All Groups');
        const result = await this.docClient.scan({
            TableName: this.groupsTable
          }).promise()
        
          const items = result.Items;
          return items as Group[];
    }

    async createGroup(group: Group): Promise<Group>{
        console.log('Creating group with groupId: ',group.id);

        await this.docClient.put({
            TableName: this.groupsTable,
            Item: group
          }).promise();
          return group;
    }
    
}

function createDynamoDbClient(){
    if(process.env.IS_OFFLINE){
        console.log('Creating local dynamodb instance');
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        });

    
    }
    return new XAWS.DynamoDB.DocumentClient();
}