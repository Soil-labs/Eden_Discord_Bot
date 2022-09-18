import { HexColorString } from 'discord.js';

type NumericalProperty =
	| 'AWAIT_TIMEOUT'
	| 'DISPLAY_SKILL_NUMBER'
	| 'MATCH_NUMBER'
	| 'DISPLAY_COMMON_SKILL_NUMBER'
	| 'AUTOCOMPLETE_OPTION_LENGTH'
	| 'ONBOARD_REPEAT_CONTEXT'
	| 'ONBOARD_AUTO_DELETE';
type LinkProperty =
	| 'DASHBOARD'
	| 'PROJECT_ALL'
	| 'USER'
	| 'SIGNUP'
	| 'STAGING_ONBOARD'
	| 'ROOM'
	| 'DISCORD_MSG'
	| 'LAUNCH_PROJECT'
	| 'PROJECT_TWEET';
type ErroProperty = 'GRAPHQL';
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

const _frontend = 'https://oasis-app-front-end-zeta.vercel.app';

export const NUMBER: Numerical = {
	AWAIT_TIMEOUT: 10 * 1000,
	DISPLAY_SKILL_NUMBER: 2,
	MATCH_NUMBER: 3,
	DISPLAY_COMMON_SKILL_NUMBER: 2,
	AUTOCOMPLETE_OPTION_LENGTH: 25,
	ONBOARD_REPEAT_CONTEXT: 0.25 * 60,
	ONBOARD_AUTO_DELETE: 0.25 * 60
};

export const LINK: Link = {
	DASHBOARD: _frontend + '/champion-dashboard',
	PROJECT_ALL: _frontend + '/projects?tab=1',
	USER: 'https://www.soil.xyz/profile/%s/',
	SIGNUP: _frontend + '/member/ginpsu',
	STAGING_ONBOARD: _frontend + 'onboard%s',
	ROOM: 'https://eden-foundation.vercel.app/onboard/party/%(roomId)s',
	DISCORD_MSG: 'https://discord.com/channels/%(guildId)s/%(channelId)s/%(messageId)s',
	LAUNCH_PROJECT: _frontend + '/form/%s',
	PROJECT_TWEET: _frontend + '/projects/%s/feed'
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
	GRAPHQL: 'Error occured when %(action)s: %(errorMessage)s'
};

export const EMBED_COLOR: Readonly<HexColorString> = '#74FA6D';

export default {};
