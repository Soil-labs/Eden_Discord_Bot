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
		const toBeCached: MembersCache = {};

		result.findMembers.forEach((member) => {
			toBeCached[member._id] = {
				discordName: member.discordName,
				serverId: member.serverID
			};
		});
		myCache.mySet('Members', toBeCached);
		return true;
	}
}
