import { ButtonInteraction, GuildMember } from 'discord.js';
import { MyClient } from '../structures/Client';

export interface ExtendedButtonInteraction extends ButtonInteraction {
	member: GuildMember;
}

interface ButtonRunOptions {
	client: MyClient;
	interaction: ExtendedButtonInteraction;
}

type RunFunction = (options: ButtonRunOptions) => any;
type buttonCustomId = 'onboard' | 'end';
export interface ButtonType {
	customIds: Array<buttonCustomId>;
	execute: RunFunction;
}
