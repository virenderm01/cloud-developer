import 'source-map-support/register'

import { APIGatewayProxyEvent,  APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createToDo } from '../../bussinessLogic/toDos'
import { parseUserId } from '../../auth/utils'
import { createLogger } from '../../utils/logger'
import * as middy from 'middy';
import {cors} from 'middy/middlewares'

const logger = createLogger('todo-create')


export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  logger.info('Create request', newTodo)
  
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const user = parseUserId(jwtToken)
  if(!newTodo.name || !newTodo.dueDate){
    return {
      statusCode: 400,
      body: JSON.stringify({message: "Invalid request body"})
    }
  }
  const result = await createToDo(newTodo, user);
  return {
    statusCode: 200,
    body: JSON.stringify({item: result})
  }
})


handler.use(cors({credentials: true}));
