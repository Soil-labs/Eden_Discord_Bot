import { gql } from 'graphql-request';

import { GraphQL_UpdateMemberMutation, GraphQL_UpdateMemberMutationVariables } from '../gql/result';
import { myMutation } from '../graph';

const request = gql`
	mutation UpdateMember($fields: updateMemberInput!) {
		updateMember(fields: $fields) {
			_id
		}
	}
`;

export async function updateMember(variable: GraphQL_UpdateMemberMutationVariables) {
	return myMutation<GraphQL_UpdateMemberMutationVariables, GraphQL_UpdateMemberMutation>({
		request,
		variable
	});
}
