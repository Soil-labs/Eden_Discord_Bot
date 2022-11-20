import { EmbedBuilder } from 'discord.js';

import { Button } from '../structures/Button';

export default new Button({
	customIds: ['expired', 'putoffexpire', 'expired_post'],
	execute: async ({ interaction }) => {
		const { customId, message } = interaction;
		const thread = interaction.channel;

		const buttonJson = message.components[0].toJSON();

		buttonJson.components[0].disabled = true;
		buttonJson.components[1].disabled = true;

		if (customId === 'expired_post') {
			buttonJson.components[0].disabled = false;
			buttonJson.components[1].disabled = false;
			buttonJson.components[2].disabled = true;
		}
		
		await interaction.message.edit({
			content: message.content,
			components: [buttonJson]
		});

		if (thread.isThread()) {
			if (customId === 'expired' || customId === 'expired_post') {
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
				const archiveDuration = archiveDays === 3 ? 4320 : 10080;

				await thread.setAutoArchiveDuration(archiveDuration);
				return interaction.reply({
					embeds: [
						new EmbedBuilder().setDescription(
							`<#${thread.id}> will be archived in ${archiveDays} days by <@${interaction.user.id}>.`
						)
					]
				});
			}
		} else {
			return interaction.reply({
				content:
					'Sorry, this button is unavailable in a channel. Please report this case to the admin.'
			});
		}
	}
});
