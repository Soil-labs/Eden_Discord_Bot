import { gql } from 'graphql-request';
import { GraphQL_AddNewMemberMutation, GraphQL_AddNewMemberMutationVariables } from '../gql/result';
import { myMutation } from '../graph';

const request = gql`
	mutation AddNewMember($fields: addNewMemberInput!) {
		addNewMember(fields: $fields) {
			_id
		}
	}
`;

export async function addNewMember(variable: GraphQL_AddNewMemberMutationVariables) {
	return myMutation<GraphQL_AddNewMemberMutationVariables, GraphQL_AddNewMemberMutation>({
		variable: variable,
		request: request
	});
}
