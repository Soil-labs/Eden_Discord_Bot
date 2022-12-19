import { gql } from 'graphql-request';

import { GraphQL_AddMessagesMutation, GraphQL_MutationAddMessagesArgs } from '../gql/result';
import { myMutation } from '../graph';

const request = gql`
	mutation AddMessages($fields: addMessagesInput) {
		addMessages(fields: $fields) {
			_id
		}
	}
`;

export async function addMessage(variable: GraphQL_MutationAddMessagesArgs) {
	return myMutation<GraphQL_MutationAddMessagesArgs, GraphQL_AddMessagesMutation>({
		request,
		variable
	});
}
