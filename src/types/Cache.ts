import { EmbedFieldData } from 'discord.js';
import { Maybe } from '../graph/gql/result';

export interface CacheType {
	Projects: ProjectsCache;
	Skills: SkillsCache;
	Members: MembersCache;
	Servers: GuildInformCache;
	VoiceContexts: VoiceContextCache;
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

type GuildId = string;
type MemberId = string;
type SkillId = string;
type ProjectId = string;

export type GuildInformCache = Record<GuildId, GuildInform>;
export type ProjectsCache = Record<GuildId, ProjectInform>;
export type MembersCache = Record<MemberId, MemberInform>;
export type SkillsCache = Record<SkillId, SkillInform>;
export type VoiceContextCache = Record<GuildId, VoiceContext>;

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
