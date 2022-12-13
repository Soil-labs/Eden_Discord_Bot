/* eslint-disable no-unused-vars */
import { ApplicationCommandOptionChoiceData, HexColorString } from 'discord.js';
import list from 'timezones.json';

import { GraphQL_UpdateServerInput } from '../graph/gql/result';
import { CacheType, GuildSettingInform, VoiceContext } from '../types/Cache';
import { CommandNameEmun } from '../types/Command';

type NumericalProperty =
	| 'AWAIT_TIMEOUT'
	| 'DISPLAY_SKILL_NUMBER'
	| 'MATCH_NUMBER'
	| 'DISPLAY_COMMON_SKILL_NUMBER'
	| 'AUTOCOMPLETE_OPTION_LENGTH'
	| 'ONBOARD_REPEAT_CONTEXT'
	| 'ONBOARD_AUTO_DELETE'
	| 'THREAD_SCAN'
	| 'BIRTHDAY_SCAN'
	| 'ONBOARD_CALL_SCAN';
type LinkProperty =
	| 'DASHBOARD'
	| 'PROJECT_ALL'
	| 'USER'
	| 'SIGNUP'
	| 'STAGING_ONBOARD'
	| 'ROOM'
	| 'DISCORD_MSG'
	| 'LAUNCH_PROJECT'
	| 'PROJECT_TWEET'
	| 'GARDEN_FEED'
	| 'GARDEN_GRAPH'
	| 'THREAD'
	| 'ARWEAVE_EXPLORER';
type ErroProperty = 'COMMON' | 'GRAPHQL' | 'INTERACTION' | 'BUTTON' | 'AUTO' | 'MODAL' | 'MENU';
type ContentProperty =
	| 'MATCH_PROJECT'
	| 'INVITE_DM'
	| 'INVITE_DM_FAIL'
	| 'ONBOARD_SELF'
	| 'GROUP_ONBORAD'
	| 'CHANNEL_SETTING_FAIL_REPLY'
	| 'CHANNEL_SETTING_SUCCESS_REPLY'
	| 'CHAT_TAG_NAME';

type Numerical = Readonly<Record<NumericalProperty, number>>;
type Link = Readonly<Record<LinkProperty, string>>;
type InternalError = Readonly<Record<ErroProperty, string>>;
type Content = Readonly<Record<ContentProperty, string>>;

const _frontend = process.env.PM2_FRONTEND ?? 'https://eden-foundation-develop.vercel.app';

export const NUMBER: Numerical = {
	AWAIT_TIMEOUT: 15 * 1000,
	DISPLAY_SKILL_NUMBER: 2,
	MATCH_NUMBER: 3,
	DISPLAY_COMMON_SKILL_NUMBER: 2,
	AUTOCOMPLETE_OPTION_LENGTH: 25,
	ONBOARD_REPEAT_CONTEXT: 6 * 60,
	ONBOARD_AUTO_DELETE: 2 * 60,
	THREAD_SCAN: 60 * 60 * 1000,
	BIRTHDAY_SCAN: 60 * 60 * 1000,
	ONBOARD_CALL_SCAN: 5 * 60 * 1000
};

export const LINK: Link = {
	DASHBOARD: _frontend + '/champion-board',
	PROJECT_ALL: _frontend + '/projects?tab=1',
	USER: _frontend + '/profile/%s',
	SIGNUP: _frontend + '/signup',
	STAGING_ONBOARD: _frontend + 'onboard%s',
	ROOM: 'https://eden-foundation-develop.vercel.app/onboard/party/%(roomId)s',
	DISCORD_MSG: 'https://discord.com/channels/%(guildId)s/%(channelId)s/%(messageId)s',
	LAUNCH_PROJECT: _frontend + '/launch',
	PROJECT_TWEET: _frontend + '/projects/%s/feed',
	GARDEN_FEED: 'https://eden-garden-front.vercel.app/',
	GARDEN_GRAPH: 'https://garden-rho.vercel.app/',
	THREAD: 'https://discord.com/channels/%(guildId)s/%(threadId)s',
	ARWEAVE_EXPLORER: 'https://viewblock.io/arweave/tx/'
};

export const CONTENT: Content = {
	ONBOARD_SELF:
		'In order for Eden 🌳 to recommend the right projects for you, we need to know about your skills. Add them [here](%(onboardLink)s).',
	GROUP_ONBORAD:
		'Growing the garden of opportunities is how we are all going to make it. To onboard new members, click [here](%(onboardLink)s).',
	MATCH_PROJECT: 'Find all the relevant projects for you [here](%s).',
	INVITE_DM:
		"<@%(inviterId)s> has invited you to join the tool we use to coordinate talent across the community. It uses AI to make smart, community driven recommendations for projects you'd love. To join, click [here](%(onboardLink)s).",
	INVITE_DM_FAIL:
		"Hi <@%(inviteeId)s>! Eden is the tool we use to coordinate talent across the community. It uses AI to make smart, community driven recommendations for projects you'd love. To join, click [here](%(onboardLink)s).",
	CHANNEL_SETTING_FAIL_REPLY:
		'Fail to set <#%(targetChannelId)s> as %(setChannelName)s channel, because of `%(reason)s`.',
	CHANNEL_SETTING_SUCCESS_REPLY:
		'Success to set <#%(targetChannelId)s> as %(setChannelName)s channel.',
	CHAT_TAG_NAME: 'Chat'
};

export const ERROR_REPLY: InternalError = {
	GRAPHQL: 'Error occured when running `%(action)s`: %(errorMessage)s',
	COMMON: 'Unknown Error, please report this to the admin',
	INTERACTION:
		'User: %(userName)s Guild: %(guildName)s Error: %(errorName)s occurs when executing %(commandName)s command. Msg: %(errorMsg)s Stack: %(errorStack)s.',
	BUTTON: 'User: %(userName)s Guild: %(guildName)s Error: %(errorName)s occurs when interacting %(customId)s button. Msg: %(errorMsg)s Stack: %(errorStack)s.',
	AUTO: 'User: %(userName)s Guild: %(guildName)s Error: %(errorName)s occurs when interacting %(commandName)s auto. Msg: %(errorMsg)s Stack: %(errorStack)s.',
	MODAL: 'User: %(userName)s Guild: %(guildName)s Error: %(errorName)s occurs when interacting %(customId)s modal. Msg: %(errorMsg)s Stack: %(errorStack)s.',
	MENU: 'User: %(userName)s Guild: %(guildName)s Error: %(errorName)s occurs when executing %(menuName)s menu. Msg: %(errorMsg)s Stack: %(errorStack)s.'
};

type CacheKeys = keyof CacheType;
export const CACHE_KEYS: Readonly<Record<CacheKeys, CacheKeys>> = {
	Projects: 'Projects',
	Skills: 'Skills',
	Members: 'Members',
	Servers: 'Servers',
	VoiceContexts: 'VoiceContexts',
	ProjectTeamRole: 'ProjectTeamRole',
	Teams: 'Teams',
	Roles: 'Roles',
	GardenContext: 'GardenContext',
	GuildSettings: 'GuildSettings',
	ChatThreads: 'ChatThreads'
};

export enum FirestoneChannelOptionName {
	Birthday = 'birthday',
	GardenForward = 'forward_garden'
}

export enum GraphQLChannelOptionName {
	Chat = 'chat'
}

export const FirestoneChanneOptionNameToDbPropery: Readonly<
	Record<FirestoneChannelOptionName, keyof GuildSettingInform>
> = {
	birthday: 'birthdayChannelId',
	forward_garden: 'forwardForumChannelId'
};

export const GraphQLChanneOptionNameToDbPropery: Readonly<
	Record<GraphQLChannelOptionName, keyof GraphQL_UpdateServerInput>
> = {
	chat: 'channelChatID'
};

export const EMBED_COLOR: Readonly<HexColorString> = '#74FA6D';

type ExtendedApplicationCommandOptionChoiceData<T extends string | number> = {
	name: CommandNameEmun;
} & ApplicationCommandOptionChoiceData<T>;

export const defaultGuildVoiceContext: VoiceContext = {
	messageId: null,
	messageLink: null,
	channelId: null,
	timestamp: null,
	hostId: null,
	attendees: null,
	roomId: null,
	isNotified: null
};

export const COMMADN_CHOICES: Array<ExtendedApplicationCommandOptionChoiceData<string>> = [
	{
		name: 'set',
		value: 'set'
	},
	{
		name: 'find',
		value: 'find'
	},
	{
		name: 'champion',
		value: 'champion'
	},
	{
		name: 'invite',
		value: 'invite'
	},
	{
		name: 'onboard',
		value: 'onboard'
	},
	{
		name: 'project',
		value: 'project'
	},
	{
		name: 'signup',
		value: 'signup'
	},
	{
		name: 'birthday',
		value: 'birthday'
	},
	{
		name: 'garden',
		value: 'garden'
	}
];

export const MONTH_ENUM: Array<ApplicationCommandOptionChoiceData<string>> = [
	{
		name: 'January',
		value: '1'
	},
	{
		name: 'February',
		value: '2'
	},
	{
		name: 'March',
		value: '3'
	},
	{
		name: 'April',
		value: '4'
	},
	{
		name: 'May',
		value: '5'
	},
	{
		name: 'June',
		value: '6'
	},
	{
		name: 'July',
		value: '7'
	},
	{
		name: 'August',
		value: '8'
	},
	{
		name: 'September',
		value: '9'
	},
	{
		name: 'October',
		value: '10'
	},
	{
		name: 'November',
		value: '11'
	},
	{
		name: 'December',
		value: '12'
	}
];

export const COMMAND_HELP: Readonly<Record<Exclude<CommandNameEmun, 'help'>, string>> = {
	birthday: '**</birthday:>**\nSet up your birthday and celebrate\n',
	champion: '',
	set: '',
	count: '',
	find: '',
	invite: '',
	onboard: '',
	project: '',
	signup: '',
	garden: '',
	endorse: '',
	collab: ''
};

export const TIMEZONELIST: Array<string> = list.reduce((pre, cur) => {
	pre.push(...cur.utc);
	return pre;
}, []);

export const EMPTYSTRING = 'NULL';

export default {};
