import { gql } from 'graphql-request';

import {
	GraphQL_FindProjects_RecommendedToUserQuery,
	GraphQL_FindProjects_RecommendedToUserQueryVariables
} from '../gql/result';
import { myQuery } from '../graph';

const request = gql`
	query FindProjects_RecommendedToUser($fields: findProjects_RecommendedToUserInput) {
		findProjects_RecommendedToUser(fields: $fields) {
			matchPercentage
			projectData {
				_id
				title
			}
			role {
				title
				skills {
					skillData {
						name
					}
				}
			}
		}
	}
`;

export async function recommendProjectsToMember(
	variable: GraphQL_FindProjects_RecommendedToUserQueryVariables
) {
	return myQuery<
		GraphQL_FindProjects_RecommendedToUserQueryVariables,
		GraphQL_FindProjects_RecommendedToUserQuery
	>({
		variable,
		request
	});
}
