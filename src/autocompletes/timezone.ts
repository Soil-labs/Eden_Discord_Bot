import { Auto } from '../structures/AutoComplete';
import { NUMBER, TIMEZONE } from '../utils/const';

export default new Auto({
	correspondingCommandName: 'birthday',
	execute: ({ interaction }) => {
		const { value } = interaction.options.getFocused(true);
		const filter = TIMEZONE.filter((option) =>
			option.name.toLowerCase().startsWith(value.toLowerCase())
		).splice(0, NUMBER.AUTOCOMPLETE_OPTION_LENGTH);

		if (filter.length === 0) return interaction.respond([]);
		return interaction.respond(filter);
	}
});
