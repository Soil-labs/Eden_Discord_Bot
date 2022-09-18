import { GuildMember, ModalSubmitInteraction } from 'discord.js';
import { MyClient } from '../structures/Client';

export interface ExtendedModalSubmitInteraction extends ModalSubmitInteraction {
	member: GuildMember;
}

interface ModalRunOptions {
	client: MyClient;
	interaction: ExtendedModalSubmitInteraction;
}

type RunFunction = (options: ModalRunOptions) => any;

// todo limit customId
export interface ModalType {
	customId: string;
	execute: RunFunction;
}