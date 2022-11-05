import { gql } from 'graphql-request';

import {
	GraphQL_AddEndorsementMutation,
	GraphQL_AddEndorsementMutationVariables
} from '../gql/result';
import { myMutation } from '../graph';

const request = gql`
	mutation AddEndorsement($fields: addEndorsementInput!) {
		addEndorsement(fields: $fields) {
			endorsements {
				endorser
				endorsementMessage
				arweaveTransactionID
			}
		}
	}
`;

export async function addEndorsement(variable: GraphQL_AddEndorsementMutationVariables) {
	return myMutation<GraphQL_AddEndorsementMutationVariables, GraphQL_AddEndorsementMutation>({
		variable: variable,
		request: request
	});
}
