import { EmbedFieldData, ThreadAutoArchiveDuration } from 'discord.js';
import { Maybe } from '../graph/gql/result';

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
	adminRole: [],
	adminMember: [],
	adminCommand: []
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

export type GuildInform = {
	adminRole: Array<string>;
	adminMember: Array<string>;
	adminCommand: Array<string>;
};

// todo this part will be integrated with GuildInform, once graphql has
export type GuildSettingInform = {
	birthdayChannelId: string;
	gardenChannelId: string;
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

export function readGuildInform(guildInform: GuildInform): EmbedFieldData[] {
	let adminInform = {
		adminRole: '> -',
		adminMember: '> -',
		adminCommand: '> -'
	};

	const { adminCommand, adminMember, adminRole } = guildInform;
	if (adminCommand.length !== 0) {
		adminInform.adminCommand = `> ${adminCommand.reduce((pre, cur) => {
			return pre + cur + '\n';
		}, '')}`;
	}
	if (adminMember.length !== 0) {
		adminInform.adminMember = `> ${adminMember.reduce((pre, cur) => {
			return pre + `<@${cur}>\n`;
		}, '')}`;
	}
	if (adminRole.length !== 0) {
		adminInform.adminRole = `> ${adminRole.reduce((pre, cur) => {
			return pre + `<@&${cur}>\n`;
		}, '')}`;
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
