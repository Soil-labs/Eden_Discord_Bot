/* eslint-disable no-unused-vars */
import { ButtonInteraction, GuildMember, Message } from 'discord.js';

import { MyClient } from '../structures/Client';

export interface ExtendedButtonInteraction extends ButtonInteraction {
	member: GuildMember;
	message: Message;
}

interface ButtonRunOptions {
	client: MyClient;
	interaction: ExtendedButtonInteraction;
}

type RunFunction = (options: ButtonRunOptions) => any;
export enum ButtonCustomIdEnum {
	EndOnboarding = 'end',
	ArchivePost = 'expired',
	PostponeArchive = 'putoffexpire',
	ArchiveGarden = 'expired_post',
	AgreeToConnect = 'connect',
	RefuseConnect = 'refuse_connect',
	NoInterest = 'no_interest'
}
export interface ButtonType {
	customIds: Array<ButtonCustomIdEnum>;
	execute: RunFunction;
}
