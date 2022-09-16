import {
	AutocompleteInteraction,
	CommandInteractionOptionResolver,
	GuildMember,
	Interaction
} from 'discord.js';
import { client } from '..';
import { Event } from '../structures/Event';
import { ExtendedButtonInteraction } from '../types/Button';
import { GuildInform } from '../types/Cache';
import { ExtendedCommandInteration } from '../types/Command';
import { ExtendedModalSubmitInteraction } from '../types/Modal';
import { myCache } from '../utils/cache';
import { logger } from '../utils/logger';
import _ from 'lodash';

export default new Event('interactionCreate', (interaction: Interaction) => {
	if (interaction.isCommand()) {
		const command = client.commands.get(interaction.commandName);
		if (!command) {
			return interaction.reply({
				content: 'You have used a non exitent command',
				ephemeral: true
			});
		}
		// if (!myCache.has('Guilds')) {
		// 	return interaction.reply({
		// 		content: COMMAND_CONTENTS.INIT_REPLY,
		// 		ephemeral: true
		// 	});
		// }
		const member = interaction.member as GuildMember;
		const guildInformCache: GuildInform = myCache.get('Guilds')[interaction.guild.id];
		const { adminCommand, adminMember, adminRole } = guildInformCache;
		if (adminCommand.includes(interaction.commandName)) {
			if (
				!adminMember.includes(member.id) &&
				_.intersection(Array.from(member.roles.cache.keys()), adminRole).length === 0
			)
				return interaction.reply({
					content: "Sorry, you don't have permission to run this command.",
					ephemeral: true
				});
		}

		try {
			command.execute({
				client: client,
				interaction: interaction as ExtendedCommandInteration,
				args: interaction.options as CommandInteractionOptionResolver
			});
		} catch (error) {
			if (interaction.deferred) {
				logger.error(error);
				return interaction.followUp({
					content: 'Unknown Error'
				});
			}
			return logger.error(error);
		}
	}

	if (interaction.isButton()) {
		const button = client.buttons.get(interaction.customId);

		if (!button) {
			return interaction.reply({
				content: 'You have clicked a non exitent button',
				ephemeral: true
			});
		}
		// if (!myCache.has('Guilds')) {
		// 	return interaction.reply({
		// 		content: COMMAND_CONTENTS.INIT_REPLY,
		// 		ephemeral: true
		// 	});
		// }

		try {
			button.execute({
				client: client,
				interaction: interaction as ExtendedButtonInteraction
			});
		} catch (error) {
			if (interaction.deferred) {
				logger.error(error);
				return interaction.followUp({
					content: 'Unknown Error'
				});
			}
			return logger.error(error);
		}
	}

	if (interaction.isModalSubmit()) {
		const modal = client.modals.get(interaction.customId);

		if (!modal) {
			return interaction.reply({
				content: 'You have clicked a non exitent modal',
				ephemeral: true
			});
		}
		// if (!myCache.has('Guilds')) {
		// 	return interaction.reply({
		// 		content: COMMAND_CONTENTS.INIT_REPLY,
		// 		ephemeral: true
		// 	});
		// }

		try {
			modal.execute({
				client: client,
				interaction: interaction as ExtendedModalSubmitInteraction
			});
		} catch (error) {
			if (interaction.deferred) {
				logger.error(error);
				return interaction.followUp({
					content: 'Unknown Error'
				});
			}
			return logger.error(error);
		}
	}

	if (interaction.isAutocomplete()) {
		const auto = client.autos.get(interaction.commandName);

		if (!auto) {
			logger.error(`A non exitent auto is triggered: ${interaction.commandName}`);
			return interaction.respond([]);
		}

		try {
			auto.execute({
				client: client,
				interaction: interaction as AutocompleteInteraction
			});
		} catch (error) {
			return logger.error(error);
		}
	}
});
