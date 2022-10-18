import { gql } from 'graphql-request';

import {
	GraphQL_MatchMembersToSkillsQuery,
	GraphQL_MatchMembersToSkillsQueryVariables
} from '../gql/result';
import { myQuery } from '../graph';

const request = gql`
	query MatchMembersToSkills($fields: matchMembersToSkillInput) {
		matchMembersToSkills(fields: $fields) {
			matchPercentage
			member {
				_id
				discordName
			}
			commonSkills {
				name
			}
		}
	}
`;

export async function matchMemberToSkills(variable: GraphQL_MatchMembersToSkillsQueryVariables) {
	return myQuery<GraphQL_MatchMembersToSkillsQueryVariables, GraphQL_MatchMembersToSkillsQuery>({
		variable: variable,
		request: request
	});
}
