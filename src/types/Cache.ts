import { EmbedFieldData } from 'discord.js';

export type ChannelOptionName = 'txcheck' | 'support';
export type PermissionName = 'adminRole' | 'adminMember' | 'adminCommand';

type ChannelInform = Record<ChannelOptionName, string | null>;
type PermissionInform = Record<PermissionName, string[]>;

export interface GuildInform {
	partnerName: string;
	proxyContract: Array<string>;
	channel: ChannelInform;
	permission: PermissionInform;
}

export const templateGuildInform: GuildInform = {
	partnerName: null,
	proxyContract: [],
	channel: {
		txcheck: null,
		support: null
	},
	permission: {
		adminRole: [],
		adminMember: [],
		adminCommand: []
	}
};

type GuildId = string;
export type GuildInformCache = Record<GuildId, GuildInform>;

export function readGuildInform(guildInform: GuildInform): EmbedFieldData[] {
	interface ChannelInform {
		channelName: string;
		channelValue: string;
	}
	let channelInform: ChannelInform = {
		channelName: '',
		channelValue: ''
	};
	channelInform = Object.keys(guildInform.channel).reduce<ChannelInform>(
		(pre: ChannelInform, cur: string) => {
			pre.channelName += `> **${cur.toLocaleUpperCase()} CHANNEL**\n`;
			const channel = guildInform.channel[cur];
			if (channel) {
				pre.channelValue += `> <#${channel}>\n`;
			} else {
				pre.channelValue += '> `Undefined`\n';
			}
			return pre;
		},
		channelInform
	);

	let adminInform = {
		adminRole: '> -',
		adminMember: '> -',
		adminCommand: '> -'
	};

	const { adminCommand, adminMember, adminRole } = guildInform.permission;
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

	let contract = '> -';
	const contractAddrs = guildInform.proxyContract;
	if (contractAddrs.length !== 0) {
		contract = `> ${contractAddrs.reduce((pre, cur) => {
			return pre + `\`${cur}\`\n`;
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
		},
		{
			name: 'Channel Configuration',
			value: channelInform.channelName,
			inline: true
		},
		{
			name: 'Target Channel',
			value: channelInform.channelValue,
			inline: true
		},
		{
			name: 'Proxy Contract',
			value: contract,
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
