import { gql } from 'graphql-request';

import { GraphQL_AddMessageMutation, GraphQL_AddMessageMutationVariables } from '../gql/result';
import { myMutation } from '../graph';

const request = gql`
	mutation AddMessage($fields: addMessageInput) {
		addMessage(fields: $fields) {
			_id
		}
	}
`;

export async function addMessage(variable: GraphQL_AddMessageMutationVariables) {
	return myMutation<GraphQL_AddMessageMutationVariables, GraphQL_AddMessageMutation>({
		request,
		variable
	});
}
