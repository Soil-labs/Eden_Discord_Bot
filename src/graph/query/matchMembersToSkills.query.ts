import { gql } from 'graphql-request';

import {
	GraphQL_MatchMembersToSkillsQuery,
	GraphQL_MatchMembersToSkillsQueryVariables
} from '../gql/result';
import { myQuery } from '../graph';

// todo to be changed in the future
const request = gql`
	query MatchMembersToSkills($fields: matchMembersToSkillInput) {
		matchMembersToSkills(fields: $fields) {
			matchPercentage {
				totalPercentage
				realTotalPercentage
				skillTotalPercentage
				hoursPercentage
				budgetPercentage
			}
			member {
				_id
				discordName
			}
			skillsPercentage {
				percentage100
				percentageReal
			}
		}
	}
`;

export async function matchMemberToSkills(variable: GraphQL_MatchMembersToSkillsQueryVariables) {
	return myQuery<GraphQL_MatchMembersToSkillsQueryVariables, GraphQL_MatchMembersToSkillsQuery>({
		variable,
		request
	});
}
