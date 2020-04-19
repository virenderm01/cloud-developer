import 'source-map-support/register'

import { APIGatewayProxyEvent,  APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { parseUserId } from '../../auth/utils'
import { createLogger } from '../../utils/logger'
import { updateToDo } from '../../bussinessLogic/toDos'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
const logger = createLogger('todo-update')


export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  logger.info('>>> Update item: ', {todoId, updatedTodo});
  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  const authorization = event.headers.Authorization
	const split = authorization.split(' ')
	const jwtToken = split[1]
	const user = parseUserId(jwtToken)
  
	const result = await updateToDo(user, todoId, updatedTodo)
	logger.info('<<< Update result: ', {result})
	return {
	  statusCode: 200,
    body: JSON.stringify({item: result})
  }
})


handler.use(cors({credentials: true}));