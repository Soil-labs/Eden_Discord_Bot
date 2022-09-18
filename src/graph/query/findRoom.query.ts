import { gql } from 'graphql-request';
import { GraphQL_FindRoomQuery, GraphQL_FindRoomQueryVariables } from '../gql/result';
import { myQuery } from '../graph';

const request = gql`
	query FindRoom($fields: findRoomsInput) {
		findRoom(fields: $fields) {
			members {
				_id
			}
		}
	}
`;

export async function findRoom(variable: GraphQL_FindRoomQueryVariables) {
	return myQuery<GraphQL_FindRoomQueryVariables, GraphQL_FindRoomQuery>({
        request: request,
        variable: variable
    });
}
