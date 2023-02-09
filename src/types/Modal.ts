/* eslint-disable no-unused-vars */
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
export enum ModalCustomIdEnum {
	UpdateGardenInfo = 'update'
}

export enum TextInputCustomIdEnum {
	GardenTitle = 'garden_title',
	GardenContent = 'garden_content'
}

export interface ModalType {
	customId: ModalCustomIdEnum;
	execute: RunFunction;
}
