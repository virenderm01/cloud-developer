import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { parseUserId } from '../../auth/utils'
import { deleteToDo } from '../../bussinessLogic/toDos'
import { createLogger } from '../../utils/logger'
import * as middy from 'middy';
import { cors } from 'middy/middlewares'

const logger = createLogger('delete-to-do');


export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  // TODO: Remove a TODO item by id
	const authorization = event.headers.Authorization
	const split = authorization.split(' ')
	const jwtToken = split[1]
	const user = parseUserId(jwtToken)
  const deleteId = await deleteToDo(user, todoId)
	logger.info('<<< Deleted item: ', {deleteId})
	return {
	  statusCode: 200,
    body: JSON.stringify({todoId: deleteId})
  }
})


handler.use(cors({credentials: true}));
