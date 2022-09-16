import { gql } from 'graphql-request';
import { SkillsCache } from '../../types/Cache';
import { myCache } from '../../utils/cache';
import {
	GraphQL_ApprovedSkillEnum,
	GraphQL_FindSkillsQuery,
	GraphQL_FindSkillsQueryVariables
} from '../gql/result';
import { myQuery } from '../graph';

const request = gql`
	query FindSkills($fields: findSkillsInput) {
		findSkills(fields: $fields) {
			_id
			name
			state
		}
	}
`;

export async function findSkills() {
	const [result, error] = await myQuery<
		GraphQL_FindSkillsQueryVariables,
		GraphQL_FindSkillsQuery
	>({
		request: request,
		variable: {
			fields: {}
		}
	});

	if (error) return false;
	else {
		const toBeCached: SkillsCache = {};
		result.findSkills.forEach((skill) => {
			if (skill.state === GraphQL_ApprovedSkillEnum.Approved) {
				toBeCached[skill._id] = {
					name: skill.name
				};
			}
		});
		myCache.mySet('Skills', toBeCached);
		return true
	}
}
