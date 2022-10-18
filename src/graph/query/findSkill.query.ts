import { gql } from 'graphql-request';

import { GraphQL_FindSkillQuery, GraphQL_FindSkillQueryVariables } from '../gql/result';
import { myQuery } from '../graph';

const request = gql`
	query FindSkill($fields: findSkillInput) {
		findSkill(fields: $fields) {
			name
			members {
				_id
			}
		}
	}
`;

export async function findSkill(variable: GraphQL_FindSkillQueryVariables) {
	return myQuery<GraphQL_FindSkillQueryVariables, GraphQL_FindSkillQuery>({
		request: request,
		variable: variable
	});
}
