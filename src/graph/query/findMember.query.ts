import { gql } from 'graphql-request';

import { GraphQL_FindMemberQuery, GraphQL_FindMemberQueryVariables } from '../gql/result';
import { myQuery } from '../graph';

const request = gql`
	query FindMember($fields: findMemberInput) {
		findMember(fields: $fields) {
			skills {
				skillInfo {
					name
					authors {
						discordName
					}
				}
			}
			projects {
				info {
					title
				}
			}
			hoursPerWeek
		}
	}
`;

export async function findMember(variable: GraphQL_FindMemberQueryVariables) {
	return myQuery<GraphQL_FindMemberQueryVariables, GraphQL_FindMemberQuery>({
		request: request,
		variable: variable
	});
}
