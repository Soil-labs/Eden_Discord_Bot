import { gql } from 'graphql-request';
import { GraphQL_FindProjectQuery, GraphQL_FindProjectQueryVariables } from '../gql/result';
import { myQuery } from '../graph';

const request = gql`
	query FindProject($fields: findProjectInput) {
		findProject(fields: $fields) {
			_id
			title
			role {
				title
			}
			champion {
				_id
				discordName
			}
		}
	}
`;

export async function findProject(variable: GraphQL_FindProjectQueryVariables) {
	return myQuery<GraphQL_FindProjectQueryVariables, GraphQL_FindProjectQuery>({
        request: request,
        variable: variable
    });
}
