import { gql } from 'graphql-request';
import {
	ProjectsCache,
	ProjectTeamRoleCache,
	RoleInform,
	RolesCache,
	RoleValueType,
	TeamInform,
	TeamsCache,
	TeamValueType
} from '../../types/Cache';
import { myCache } from '../../structures/Cache';
import { GraphQL_FindProjectsQuery, GraphQL_FindProjectsQueryVariables } from '../gql/result';
import { myQuery } from '../graph';

const request = gql`
	query FindProjects($fields: findProjectsInput) {
		findProjects(fields: $fields) {
			_id
			title
			serverID
			gardenServerID
			garden_teams {
				_id
				name
				categoryDiscordlD
				channelGeneralDiscordID
				roles {
					_id
					name
				}
			}
		}
	}
`;

// todo reasonable return value
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
	if (error) return error;
	else {
		let projectCached: ProjectsCache = {};
		let projectTeamRoleCached: ProjectTeamRoleCache = {};
		let teamCached: TeamsCache = {};
		let roleCached: RolesCache = {};
		result.findProjects.forEach((value) => {
			const {
				serverID: servers,
				_id: projectId,
				title: projectTitle,
				garden_teams: teams,
				gardenServerID: gardenServerId
			} = value;
			if (servers.length === 0) return;

			let ptrTeamCache: TeamValueType = {};

			let teamsCache: TeamInform = {};
			let rolesCache: RoleInform = {};

			if (teams.length !== 0) {
				teams.forEach((team) => {
					const {
						_id: teamId,
						name: teamName,
						roles,
						categoryDiscordlD,
						channelGeneralDiscordID
					} = team;
					if (roles.length === 0) return;
					let _internalRolesCache: RoleValueType = {};
					roles.forEach((role) => {
						const roleId = role._id;
						const roleName = role.name;
						_internalRolesCache = {
							..._internalRolesCache,
							[roleId]: {
								roleName: roleName
							}
						};
						rolesCache = {
							...rolesCache,
							[roleId]: {
								roleName: roleName
							}
						};
					});

					ptrTeamCache = {
						...ptrTeamCache,
						[teamId]: {
							teamName: teamName,
							categoryChannelId: categoryDiscordlD,
							generalChannelId: channelGeneralDiscordID,
							roles: _internalRolesCache
						}
					};

					teamsCache = {
						...teamsCache,
						[teamId]: {
							teamName: teamName
						}
					};
				});
			}
			// todo Notice: projectTeamRoleCached donot cache those projects without teams
			if (gardenServerId) {
				if (projectTeamRoleCached[gardenServerId]) {
					projectCached[gardenServerId][projectId] = {
						title: projectTitle
					};
					if (teams.length !== 0) {
						projectTeamRoleCached[gardenServerId][projectId] = {
							teams: ptrTeamCache,
							projectTitle: projectTitle
						};
					}
				} else {
					projectCached[gardenServerId] = {
						[projectId]: {
							title: projectTitle
						}
					};
					if (teams.length !== 0) {
						projectTeamRoleCached[gardenServerId] = {
							[projectId]: {
								teams: ptrTeamCache,
								projectTitle: projectTitle
							}
						};
					}
				}
			}
			servers.forEach((serverId) => {
				if (teamCached[serverId]) {
					teamCached[serverId] = {
						...teamCached[serverId],
						...teamsCache
					};
				} else {
					teamCached[serverId] = {
						...teamsCache
					};
				}
				if (roleCached[serverId]) {
					roleCached[serverId] = {
						...roleCached[serverId],
						...rolesCache
					};
				} else {
					roleCached[serverId] = {
						...rolesCache
					};
				}
			});
		});
		myCache.mySet('Projects', projectCached);
		myCache.mySet('ProjectTeamRole', projectTeamRoleCached);
		myCache.mySet('Teams', teamCached);
		myCache.mySet('Roles', roleCached);
		return true;
	}
}
