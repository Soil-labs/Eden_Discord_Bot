import { gql } from 'graphql-request';

import { myCache } from '../../structures/Cache';
import { MembersCache } from '../../types/Cache';
import { GraphQL_FindMembersQuery, GraphQL_FindMembersQueryVariables } from '../gql/result';
import { myQuery } from '../graph';

const request = gql`
	query FindMembers($fields: findMembersInput) {
		findMembers(fields: $fields) {
			discordName
			_id
			serverID
		}
	}
`;

export async function findMembers() {
	const { result, error } = await myQuery<
		GraphQL_FindMembersQueryVariables,
		GraphQL_FindMembersQuery
	>({
		request,
		variable: { fields: {} }
	});

	if (error) return error;
	else {
		if (!result.findMembers || result.findMembers.length === 0) return;

		myCache.mySet(
			'Members',
			result.findMembers.reduce((pre, cur) => {
				pre[cur._id] = {
					discordName: cur.discordName,
					serverId: cur.serverID
				};
				return pre;
			}, {}) as MembersCache
		);
		return true;
	}
}
