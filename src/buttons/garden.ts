import { Button } from '../structures/Button';

export default new Button({
	customIds: ['expired', 'putoffexpire'],
	execute: async ({ interaction }) => {
		const { customId, message } = interaction;
		const thread = interaction.channel;
		message.components[0].components[0].disabled = true;
		message.components[0].components[1].disabled = true;

		await interaction.message.edit({
			content: message.content,
			components: message.components
		});

		if (thread.isThread()) {
			if (customId === 'expired') {
				await interaction.reply({
					content: `<#${thread.id}> has been archived.`
				});
				return thread.setArchived();
			} else {
				const archiveDays = Number(
					interaction.component.label.match(/\s\d{1}\s/)[0].slice(1)
				);
				const archiveDuration = archiveDays === 3 ? 4320 : 10080;
				thread.setAutoArchiveDuration(archiveDuration);
				return interaction.reply({
					content: `<#${thread.id}> will be archived in ${archiveDays} days.`
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