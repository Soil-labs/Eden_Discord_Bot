import { gql } from 'graphql-request';

import {
	GraphQL_FindProjectUpdatesQuery,
	GraphQL_FindProjectUpdatesQueryVariables
} from '../gql/result';
import { myQuery } from '../graph';

const request = gql`
	query FindProjectUpdates($fields: findProjectUpdatesINPUT) {
		findProjectUpdates(fields: $fields) {
			threadDiscordID
			author {
				_id
			}
			serverID
		}
	}
`;

export async function findProjectUpdates() {
	return myQuery<GraphQL_FindProjectUpdatesQueryVariables, GraphQL_FindProjectUpdatesQuery>({
		request: request,
		variable: {
			fields: {}
		}
	});
}
