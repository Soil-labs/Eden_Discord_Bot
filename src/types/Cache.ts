import { ThreadAutoArchiveDuration } from 'discord.js';

import { GraphQL_UpdateServerInput, Maybe } from '../graph/gql/result';

export interface CacheType {
	Projects: ProjectsCache;
	Skills: SkillsCache;
	Members: MembersCache;
	Servers: GuildInformCache;
	VoiceContexts: VoiceContextCache;
	ProjectTeamRole: ProjectTeamRoleCache;
	Teams: TeamsCache;
	Roles: RolesCache;
	GardenContext: GardenContextCache;
	GuildSettings: GuildSettingCache;
	ChatThreads: ChatThreadCache;
}

export const templateGuildInform: GuildInform = {
	adminRoles: [],
	adminCommands: [],
	adminID: [],
	channelChatID: null
};

export const templateGuildSettingInform: GuildSettingInform = {
	birthdayChannelId: null,
	forwardForumChannelId: null
};

export type VoiceContext = {
	messageId: Maybe<string>;
	messageLink: Maybe<string>;
	channelId: Maybe<string>;
	timestamp: Maybe<number>;
	hostId: Maybe<MemberId>;
	attendees: Maybe<Array<MemberId>>;
	roomId: Maybe<string>;
	isNotified: Maybe<boolean>;
};

export type GuildInform = Required<
	Pick<GraphQL_UpdateServerInput, 'adminCommands' | 'adminID' | 'adminRoles' | 'channelChatID'>
>;

// todo this part will be integrated with GuildInform, once graphql has
export type GuildSettingInform = {
	birthdayChannelId: string;
	forwardForumChannelId: string;
};

export type ProjectInform = {
	[projectId: ProjectId]: {
		title: string;
	};
};

export type MemberInform = {
	discordName: string;
	serverId: Array<string>;
};

export type SkillInform = {
	name: string;
};

export type TeamInform = {
	[teamId: TeamId]: {
		teamName: string;
		forumChannelId: string;
	};
};

export type RoleInform = {
	[roleId: RoleId]: {
		roleName: string;
	};
};

export type ProjectTeamRoleInform = {
	[projectId: ProjectId]: {
		projectTitle: string;
		teams: TeamValueType;
	};
};

export type GardenInform = {
	categoryChannelId: string;
	forumChannelId: string;
	projectId: ProjectId;
	projectTitle: string;
	memberIds: Array<MemberId>;
	teamIds: Array<TeamId>;
	teamName: string;
	roleIds: Array<RoleId>;
	roleName: string;
	tagId: string;
	autoArchiveDuration: Maybe<ThreadAutoArchiveDuration>;
	tokenAmount: Maybe<number>;
};

export type GuildId = string;
export type MemberId = string;
export type SkillId = string;
export type ProjectId = string;
export type TeamId = string;
export type RoleId = string;
export type GardenMemberId = `${GuildId}_${MemberId}`;
export type RoleValueType = {
	[roleId: string]: {
		roleName: string;
	};
};
export type TeamValueType = {
	[teamId: string]: {
		teamName: string;
		categoryChannelId: string;
		forumChannelId: string;
		roles: RoleValueType;
	};
};

export type BirthdayInform = {
	date: number;
	day: string;
	month: string;
	offset: string;
};

export type GuildInformCache = Record<GuildId, GuildInform>;
export type ProjectsCache = Record<GuildId, ProjectInform>;
export type MembersCache = Record<MemberId, MemberInform>;
export type SkillsCache = Record<SkillId, SkillInform>;
export type VoiceContextCache = Record<GuildId, VoiceContext>;
export type TeamsCache = Record<GuildId, TeamInform>;
export type RolesCache = Record<GuildId, RoleInform>;
export type ProjectTeamRoleCache = Record<GuildId, ProjectTeamRoleInform>;
export type GardenContextCache = Record<GardenMemberId, GardenInform>;
export type GuildSettingCache = Record<GuildId, GuildSettingInform>;
export type BirthdayCache = Record<MemberId, BirthdayInform>;
export type ChatThreadCache = Record<GuildId, Array<string>>;
