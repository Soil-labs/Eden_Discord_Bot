import { gql } from 'graphql-request';
import { title } from 'process';
import { ProjectsCache } from '../../types/Cache';
import { myCache } from '../../utils/cache';
import { GraphQL_FindProjectsQuery, GraphQL_FindProjectsQueryVariables } from '../gql/result';
import { myQuery } from '../graph';

// todo fields: {id, serverId, gardenId} how to query a project, the usage of gardenId
const request = gql`
	query FindProjects($fields: findProjectsInput) {
		findProjects(fields: $fields) {
			_id
			title
			serverID
		}
	}
`;

export async function findProjects() {
	const [result, error] = await myQuery<
		GraphQL_FindProjectsQueryVariables,
		GraphQL_FindProjectsQuery
	>({
		request: request,
		variable: {
			fields: {}
		}
	});
	if (error) return false;
	else {
		const toBeCached: ProjectsCache = {};
		result.findProjects.forEach((project) => {
			const serverIds = project.serverID;
			if (serverIds.length === 0) return;
			serverIds.forEach((serverId) => {
				if (/\d+/.test(serverId)) {
					if (serverId in toBeCached) {
						toBeCached[serverId][project._id] = {
							title: project.title
						};
					} else {
						toBeCached[serverId] = {
							[project._id]: {
								title: project.title
							}
						};
					}
				}
			});
		});
		myCache.mySet('Projects', toBeCached);
		return true;
	}
}
