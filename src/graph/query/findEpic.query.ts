import { gql } from 'graphql-request';
import { GraphQL_FindEpicQuery, GraphQL_FindEpicQueryVariables } from '../gql/result';
import { myQuery } from '../graph';

// todo why serverId of tast is an array?
// todo why task embeds task, infinite loop
const request = gql`
	query FindEpic($fields: findEpicInput) {
		findEpic(fields: $fields) {
			_id
			name
			phase
			serverID
			task {
				_id
				title
				serverID
			}
			author {
				discordName
				_id
			}
			channelDiscordlID
		}
	}
`;

export async function findEpic() {
	return myQuery<GraphQL_FindEpicQueryVariables, GraphQL_FindEpicQuery>({
		request: request,
		variable: {
			fields: {}
		}
	});
}
