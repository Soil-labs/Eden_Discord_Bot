import { gql } from 'graphql-request';

import {
	GraphQL_CreateProjectUpdateMutation,
	GraphQL_CreateProjectUpdateMutationVariables
} from '../gql/result';
import { myMutation } from '../graph';

const request = gql`
	mutation CreateProjectUpdate($fields: createProjectUpdateInput!) {
		createProjectUpdate(fields: $fields) {
			_id
		}
	}
`;

export async function createProjectUpdate(variable: GraphQL_CreateProjectUpdateMutationVariables) {
	return myMutation<
		GraphQL_CreateProjectUpdateMutationVariables,
		GraphQL_CreateProjectUpdateMutation
	>({
		request,
		variable
	});
}
