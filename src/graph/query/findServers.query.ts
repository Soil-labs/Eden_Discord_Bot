import { gql } from 'graphql-request';

import { myCache } from '../../structures/Cache';
import { GuildInformCache } from '../../types/Cache';
import { GraphQL_FindServersQuery, GraphQL_FindServersQueryVariables } from '../gql/result';
import { myQuery } from '../graph';

const request = gql`
	query FindServers($fields: findServersInput) {
		findServers(fields: $fields) {
			_id
			adminID
			adminRoles
			adminCommands
		}
	}
`;

export async function findServers() {
	const { result, error } = await myQuery<
		GraphQL_FindServersQueryVariables,
		GraphQL_FindServersQuery
	>({
		request: request,
		variable: {
			fields: {}
		}
	});

	if (error) return error;
	else {
		const toBeCached: GuildInformCache = {};

		result.findServers.forEach((server) => {
			toBeCached[server._id] = {
				adminCommands: server.adminCommands,
				adminID: server.adminID,
				adminRoles: server.adminRoles
			};
		});
		myCache.mySet('Servers', toBeCached);
		return true;
	}
}
