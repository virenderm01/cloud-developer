import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import {createLogger} from "../../utils/logger";
import * as middy from 'middy'
import {cors} from "middy/middlewares";
import * as AWS from "aws-sdk";
import {getToDoItemById, updateToDo} from "../../bussinessLogic/toDos";
import {UpdateTodoRequest} from "../../requests/UpdateTodoRequest";
import { parseUserId } from '../../auth/utils';
import * as AWSXRay from 'aws-xray-sdk'
const logger = createLogger('get_upload_url')

const XAWS = AWSXRay.captureAWS(AWS)

const bucketName = process.env.TODO_S3_BUCKET;
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;

const s3 = new XAWS.S3({
	signatureVersion: 'v4'
})

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
	const todoId = event.pathParameters.todoId

	const authorization = event.headers.Authorization
	const split = authorization.split(' ')
	const jwtToken = split[1]
	const user = parseUserId(jwtToken)
	
	const uploadUrl = getSignedUrl(todoId)
	const result = await getToDoItemById(user, todoId)
	if (result) {
		logger.info('Result: ', {todoId, uploadUrl, result})
		// @ts-ignore
		const {name, dueDate, done} = result;
		const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`;
		const newData: UpdateTodoRequest = {name, dueDate, done, attachmentUrl};
		await updateToDo(user, todoId, newData);
		return {
			statusCode: 200,
			body: JSON.stringify({uploadUrl})
		}
	}
	return {
		statusCode: 500,
		body: JSON.stringify({message: 'ToDo item not found'})
	}
})

function getSignedUrl(todoId:string){
	const params = {Bucket: bucketName,
		Key: todoId,
		Expires: urlExpiration
	};
		return s3.getSignedUrl('putObject', params)
}


handler.use(cors({credentials: true}))