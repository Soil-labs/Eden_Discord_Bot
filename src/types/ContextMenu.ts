import {
	GuildMember,
	MessageApplicationCommandData,
	MessageContextMenuInteraction,
	PermissionResolvable,
	UserApplicationCommandData,
	UserContextMenuInteraction
} from 'discord.js';

export interface ExtendedUserContextMenuInteraction extends UserContextMenuInteraction {
	targetMember: GuildMember;
}

interface MessageContextMenuCommandRunOption {
	interaction: MessageContextMenuInteraction;
}

interface UserContextMenuCommandRunOption {
	interaction: ExtendedUserContextMenuInteraction;
}

type MessageContextMenuRunFunction = (options: MessageContextMenuCommandRunOption) => any;
type UserContextMenuRunFunction = (options: UserContextMenuCommandRunOption) => any;

type ContextMenuNameEnum = 'Read my profile';
export type UserContextMenuType = {
	userPermissions?: PermissionResolvable[];
	execute: UserContextMenuRunFunction;
	name: ContextMenuNameEnum;
	type: 'USER';
} & UserApplicationCommandData;

export type MessageContextMenuType = {
	userPermissions?: PermissionResolvable[];
	execute: MessageContextMenuRunFunction;
	name: ContextMenuNameEnum;
	type: 'MESSAGE';
} & MessageApplicationCommandData;
