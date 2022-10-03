import { EmbedFieldData, ThreadAutoArchiveDuration } from 'discord.js'
import { GraphQL_UpdateServerInput, Maybe } from '../graph/gql/result';
import { myCache } from '../structures/Cache';

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
}

export const templateGuildInform: GuildInform = {
	adminRoles: [],
	adminCommands: [],
	adminID: []
};

export const templateGuildSettingInform: GuildSettingInform = {
	birthdayChannelId: null
};

export type VoiceContext = {
	messageId: Maybe<string>;
	messageLink: Maybe<string>;
	channelId: Maybe<string>;
	timestamp: Maybe<number>;
	hostId: Maybe<MemberId>;
	attendees: Maybe<Array<MemberId>>;
	roomId: Maybe<string>;
};

export type GuildInform = Required<
	Pick<GraphQL_UpdateServerInput, 'adminCommands' | 'adminID' | 'adminRoles'>
>;

// todo this part will be integrated with GuildInform, once graphql has
export type GuildSettingInform = {
	birthdayChannelId: string;
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
	generalChannelId: string;
	projectId: ProjectId;
	projectTitle: string;
	memberIds: Array<MemberId>;
	teamIds: Array<TeamId>;
	teamName: string;
	roleIds: Array<RoleId>;
	roleName: string;
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
		generalChannelId: string;
		roles: RoleValueType;
	};
};

export type BirthdayInform = {
	date: number;
	day: string;
	month: string;
	offset: number;
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

export function readGuildInform(guildInform: GuildInform, guildId: GuildId): EmbedFieldData[] {
	let adminInform = {
		adminRole: '> -',
		adminMember: '> -',
		adminCommand: '> -'
	};

	const { adminCommands, adminID, adminRoles } = guildInform;
	if (adminCommands.length !== 0) {
		adminInform.adminCommand = `> ${adminCommands.reduce((pre, cur) => {
			return pre + `> ${cur}\n`;
		}, '')}`;
	}
	if (adminID.length !== 0) {
		adminInform.adminMember = `> ${adminID.reduce((pre, cur) => {
			return pre + `> <@${cur}>\n`;
		}, '')}`;
	}
	if (adminRoles.length !== 0) {
		adminInform.adminRole = `> ${adminRoles.reduce((pre, cur) => {
			return pre + `> <@&${cur}>\n`;
		}, '')}`;
	}

	let birthdayChannel = '> -';
	if (myCache.myHas('GuildSettings')) {
		const guildSettingInform = myCache.myGet('GuildSettings')[guildId];
		if (guildSettingInform?.birthdayChannelId) {
			birthdayChannel = `> <#${guildSettingInform?.birthdayChannelId}>\n`;
		}
	}

	return [
		{
			name: 'Admin Role',
			value: adminInform.adminRole,
			inline: true
		},
		{
			name: 'Admin Member',
			value: adminInform.adminMember,
			inline: true
		},
		{
			name: 'Admin Command',
			value: adminInform.adminCommand,
			inline: true
		},
		{
			name: 'Birthday Channel',
			value: birthdayChannel,
			inline: false
		}
	];
}

export function initGuildInform(guildIds: GuildId[]) {
	return guildIds.reduce((pre: GuildInformCache, cur) => {
		return {
			...pre,
			[cur]: templateGuildInform
		};
	}, {});
}
