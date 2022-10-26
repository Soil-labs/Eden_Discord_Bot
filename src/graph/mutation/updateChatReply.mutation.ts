import { gql } from 'graphql-request';

import {
	GraphQL_UpdateChatReplyMutation,
	GraphQL_UpdateChatReplyMutationVariables
} from '../gql/result';
import { myMutation } from '../graph';

const request = gql`
	mutation UpdateChatReply($fields: updateChatReplyInput) {
		updateChatReply(fields: $fields) {
			_id
		}
	}
`;

export async function updateChatReply(variable: GraphQL_UpdateChatReplyMutationVariables) {
	return myMutation<GraphQL_UpdateChatReplyMutationVariables, GraphQL_UpdateChatReplyMutation>({
		request: request,
		variable: variable
	});
}
