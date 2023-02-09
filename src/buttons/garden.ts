import { EmbedBuilder, ThreadAutoArchiveDuration } from 'discord.js';

import { Button } from '../structures/Button';
import { ButtonCustomIdEnum } from '../types/Button';

export default new Button({
	customIds: [
		ButtonCustomIdEnum.ArchivePost,
		ButtonCustomIdEnum.PostponeArchive,
		ButtonCustomIdEnum.ArchiveGarden
	],
	execute: async ({ interaction }) => {
		const { customId, message } = interaction;
		const thread = interaction.channel;

		const buttonJson = message.components[0].toJSON();

		buttonJson.components[0].disabled = true;
		buttonJson.components[1].disabled = true;

		if (customId === ButtonCustomIdEnum.ArchiveGarden) {
			buttonJson.components[0].disabled = false;
			buttonJson.components[1].disabled = false;
			buttonJson.components[2].disabled = true;
		}

		await interaction.message.edit({
			content: message.content,
			components: [buttonJson]
		});

		if (thread.isThread()) {
			if (
				customId === ButtonCustomIdEnum.ArchivePost ||
				customId === ButtonCustomIdEnum.ArchiveGarden
			) {
				await interaction.reply({
					embeds: [
						new EmbedBuilder().setDescription(
							`<#${thread.id}> has been archived by <@${interaction.user.id}>.`
						)
					]
				});
				return thread.setArchived();
			} else {
				const archiveDays = Number(
					interaction.component.label.match(/\s\d{1}\s/)[0].slice(1)
				);
				const archiveDuration =
					archiveDays === 3
						? ThreadAutoArchiveDuration.ThreeDays
						: ThreadAutoArchiveDuration.OneWeek;

				await interaction.reply({
					embeds: [
						new EmbedBuilder().setDescription(
							`<#${thread.id}> will be archived in ${archiveDays} days, set by <@${interaction.user.id}>.`
						)
					]
				});
				return thread.setAutoArchiveDuration(archiveDuration);
			}
		} else {
			return interaction.reply({
				content:
					'Sorry, this button is unavailable in a channel. Please report this case to the admin.'
			});
		}
	}
});
