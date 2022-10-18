import { gql } from 'graphql-request';

import { myCache } from '../../structures/Cache';
import { SkillsCache } from '../../types/Cache';
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
	const { result, error } = await myQuery<
		GraphQL_FindSkillsQueryVariables,
		GraphQL_FindSkillsQuery
	>({
		request: request,
		variable: {
			fields: {}
		}
	});

	if (error) return error;
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
		return true;
	}
}
