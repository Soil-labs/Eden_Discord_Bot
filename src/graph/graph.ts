import { GraphQLClient } from 'graphql-request';
import { TimeOutError } from '../utils/error';
import { awaitWrapWithTimeout } from '../utils/util';

const _client = new GraphQLClient('https://oasis-botdevelopment.up.railway.app/graphql', {
	headers: {}
});

// todo replace string with types of errors
export type GraphReturn<T> = [T, string];
type GraphParam<T> = {
	variable: T;
	request: any;
};

// todo timeout adjustment
// todo correctly handle error from graphql
export async function myQuery<T, K>(params: GraphParam<T>): Promise<GraphReturn<K>> {
	const { result, error } = await awaitWrapWithTimeout(
		_client.request<K>(params.request, params.variable)
	);

	if (error instanceof TimeOutError) {
		return [null, error.message];
	}
	if (error?.response) {
		return [null, error.response.errors[0]?.message];
	}
	return [result, null];
}

// todo timeout adjustment
// todo correctly handle error from graphql
export async function myMutation<T, K>(params: GraphParam<T>): Promise<GraphReturn<K>> {
	const { result, error } = await awaitWrapWithTimeout(
		_client.request<K>(params.request, params.variable)
	);
	if (error instanceof TimeOutError) {
		return [null, error.message];
	}
	if (error?.response) {
		return [null, error.response.errors[0]?.message];
	}
	return [result, null];
}
