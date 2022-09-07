import { AutocompleteInteraction } from 'discord.js';
import { MyClient } from '../structures/Client';

interface AutoRunOptions {
	client: MyClient;
	interaction: AutocompleteInteraction;
}

type RunFunction = (options: AutoRunOptions) => any;
type CommandName = 'guild';
export interface AutoType {
	CorrespondingCommandName: CommandName;
	execute: RunFunction;
}
