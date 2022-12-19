import { gql } from 'graphql-request';

import { GraphQL_UpdateServerMutation, GraphQL_UpdateServerMutationVariables } from '../gql/result';
import { myMutation } from '../graph';

const request = gql`
	mutation UpdateServer($fields: updateServerInput) {
		updateServer(fields: $fields) {
			_id
		}
	}
`;

export async function updateServer(variable: GraphQL_UpdateServerMutationVariables) {
	return myMutation<GraphQL_UpdateServerMutationVariables, GraphQL_UpdateServerMutation>({
		request,
		variable
	});
}
