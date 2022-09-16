import { HexColorString } from 'discord.js';

type NumericalProperty =
	| 'AWAIT_TIMEOUT'
	| 'DISPLAY_SKILL_NUMBER'
	| 'MATCH_NUMBER'
	| 'DISPLAY_COMMON_SKILL_NUMBER';
type LinkProperty = 'DASHBOARD' | 'PROJECT_ALL' | 'USER';
type ErroProperty = 'GRAPHQL';
type ContentProperty = 'MATCH_PROJECT';

type Numerical = Readonly<Record<NumericalProperty, number>>;
type Link = Readonly<Record<LinkProperty, string>>;
type InternalError = Readonly<Record<ErroProperty, string>>;
type Content = Readonly<Record<ContentProperty, string>>;

const _frontend = 'https://oasis-app-front-end-zeta.vercel.app';

export const NUMBER: Numerical = {
	AWAIT_TIMEOUT: 10 * 1000,
	DISPLAY_SKILL_NUMBER: 2,
	MATCH_NUMBER: 3,
	DISPLAY_COMMON_SKILL_NUMBER: 2
};

export const LINK: Link = {
	DASHBOARD: _frontend + '/champion-dashboard',
	PROJECT_ALL: _frontend + '/projects?tab=1',
	USER: 'https://www.soil.xyz/profile/%s/'
};

export const CONTENT: Content = {
	MATCH_PROJECT: 'Find all the relevant projects for you [here](%s).'
};

export const ERROR: InternalError = {
	GRAPHQL: 'Error occured when %(action)s: %(errorMessage)s'
};

export const EMBED_COLOR: Readonly<HexColorString> = '#74FA6D';

export default {};
