import { ApplicationCommandOptionChoiceData, HexColorString } from 'discord.js';
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
	| 'BIRTHDAY_SCAN';
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
	| 'THREAD';
type ErroProperty = 'COMMON' | 'GRAPHQL' | 'INTERACTION' | 'BUTTON' | 'AUTO' | 'MODAL' | 'MENU';
type ContentProperty =
	| 'MATCH_PROJECT'
	| 'INVITE_DM'
	| 'INVITE_DM_FAIL'
	| 'ONBOARD_SELF'
	| 'GROUP_ONBORAD';

type Numerical = Readonly<Record<NumericalProperty, number>>;
type Link = Readonly<Record<LinkProperty, string>>;
type InternalError = Readonly<Record<ErroProperty, string>>;
type Content = Readonly<Record<ContentProperty, string>>;

const _frontend = process.env.PM2_FRONTEND;

export const NUMBER: Numerical = {
	AWAIT_TIMEOUT: 15 * 1000,
	DISPLAY_SKILL_NUMBER: 2,
	MATCH_NUMBER: 3,
	DISPLAY_COMMON_SKILL_NUMBER: 2,
	AUTOCOMPLETE_OPTION_LENGTH: 25,
	ONBOARD_REPEAT_CONTEXT: 6 * 60,
	ONBOARD_AUTO_DELETE: 2 * 60,
	THREAD_SCAN: 120 * 60 * 1000,
	BIRTHDAY_SCAN: 60 * 60 * 1000
};

export const LINK: Link = {
	DASHBOARD: _frontend + '/champion-dashboard',
	PROJECT_ALL: _frontend + '/projects?tab=1',
	USER: 'https://www.soil.xyz/profile/%s/',
	SIGNUP: _frontend + '/member/ginpsu',
	STAGING_ONBOARD: _frontend + 'onboard%s',
	ROOM: 'https://eden-foundation2.vercel.app/onboard/party/%(roomId)s',
	DISCORD_MSG: 'https://discord.com/channels/%(guildId)s/%(channelId)s/%(messageId)s',
	LAUNCH_PROJECT: _frontend + '/form/%s',
	PROJECT_TWEET: _frontend + '/projects/%s/feed',
	GARDEN_FEED: 'https://eden-garden-front.vercel.app/',
	GARDEN_GRAPH: 'https://garden-rho.vercel.app/',
	THREAD: 'https://discord.com/channels/%(guildId)s/%(threadId)s'
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
		"Hi <@%(inviteeId)s>! Eden is the tool we use to coordinate talent across the community. It uses AI to make smart, community driven recommendations for projects you'd love. To join, click [here](%(onboardLink)s)."
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

export const EMBED_COLOR: Readonly<HexColorString> = '#74FA6D';

type ExtendedApplicationCommandOptionChoiceData = {
	name: CommandNameEmun;
} & ApplicationCommandOptionChoiceData;

export const COMMADN_CHOICES: Array<ExtendedApplicationCommandOptionChoiceData> = [
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
		name: 'update',
		value: 'update'
	}
];

export const MONTH_ENUM: Array<ApplicationCommandOptionChoiceData> = [
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

export const TIMEZONE: Array<ApplicationCommandOptionChoiceData> = [
	{ name: 'UTC-01', value: -1 },
	{ name: 'UTC-02', value: -2 },
	{ name: 'UTC-03', value: -3 },
	{ name: 'UTC-04', value: -4 },
	{ name: 'UTC-05', value: -5 },
	{ name: 'UTC-06', value: -6 },
	{ name: 'UTC-07', value: -7 },
	{ name: 'UTC-08', value: -8 },
	{ name: 'UTC-09', value: -9 },
	{ name: 'UTC-10', value: -10 },
	{ name: 'UTC-11', value: -11 },
	{ name: 'UTC-12', value: -12 },
	{ name: 'UTC+00', value: 0 },
	{ name: 'UTC+01', value: 1 },
	{ name: 'UTC+02', value: 2 },
	{ name: 'UTC+03', value: 3 },
	{ name: 'UTC+04', value: 4 },
	{ name: 'UTC+05', value: 5 },
	{ name: 'UTC+06', value: 6 },
	{ name: 'UTC+07', value: 7 },
	{ name: 'UTC+08', value: 8 },
	{ name: 'UTC+09', value: 9 },
	{ name: 'UTC+10', value: 10 },
	{ name: 'UTC+11', value: 11 },
	{ name: 'UTC+12', value: 12 },
	{ name: 'UTC+13', value: 13 }
];

export default {};
