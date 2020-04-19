import {TodoDbClient} from "../dataLayer/toDoDbClient";
import {createLogger} from "../utils/logger";
import {CreateTodoRequest} from '../requests/CreateTodoRequest'
import * as uuid from 'uuid'
import {TodoItem} from "../models/TodoItem";
import {UpdateTodoRequest} from "../requests/UpdateTodoRequest";

const logger = createLogger('todo-get')
const dbClient = new TodoDbClient()


function encodeNextKey(lastEvaluatedKey) {
	if (!lastEvaluatedKey) {
		return null
	}

	return encodeURIComponent(JSON.stringify(lastEvaluatedKey))
}

export async function getAllTodoItems(user: string, next, limit): Promise<Object> {
	logger.info('>> business logic:getAllTodoItems ')
	const result = await dbClient.getAllToDos(user, next, limit)
	return {
		items: result.Items,
		nextKey: encodeNextKey(result.LastEvaluatedKey)
	}
}

export async function getToDoItemById(user: string, todoId: string): Promise<Object> {
	const result = await dbClient.getToDo(user, todoId);
	if (result.Items && result.Items.length > 0) {
		return result.Items[0];
	}
	return null;
}

export async function createToDo(
		createToDoRequest: CreateTodoRequest,
		user: string
): Promise<TodoItem> {
	logger.info('>>> business logic of create: ', {createToDoRequest, user})
	//@ts-ignore
	const item: TodoItem = {...createToDoRequest, attachmentUrl: ' '};
	item.todoId = uuid.v4();
	item.userId = user;
	item.createdAt = (new Date()).toUTCString();
	item.done = false;
	return await dbClient.createToDo(item);
}

export async function deleteToDo(user, todoId: string): Promise<string> {
	return await dbClient.deleteToDo(user, todoId);
}

export async function updateToDo(user: string, todoId: string, newData: UpdateTodoRequest): Promise<Object> {
	return await dbClient.updateToDo(user, todoId, newData);
}