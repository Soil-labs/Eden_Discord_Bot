import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import { getApp } from 'firebase/app';
import { doc, getFirestore, setDoc } from 'firebase/firestore';

import { myCache } from '../structures/Cache';
import { Command } from '../structures/Command';
import { BirthdayInform } from '../types/Cache';
import { CommandNameEmun } from '../types/Command';
import { EMPTYSTRING, MONTH_ENUM } from '../utils/const';
import { awaitWrap, dateIsValid, getNextBirthday } from '../utils/util';

export default new Command({
	type: ApplicationCommandType.ChatInput,
	name: CommandNameEmun.Birthday,
	description: 'Tell me your birthday and we celebrate togather!',
	options: [
		{
			name: 'month',
			description: 'Your birthday month',
			type: ApplicationCommandOptionType.String,
			required: true,
			choices: MONTH_ENUM
		},
		{
			name: 'day',
			description: 'Your birthday day',
			type: ApplicationCommandOptionType.Integer,
			required: true
		},
		{
			name: 'timezone',
			description: 'Search and choose your city',
			type: ApplicationCommandOptionType.String,
			required: true,
			autocomplete: true
		}
	],
	execute: async ({ interaction, args }) => {
		if (!myCache.myGet('GuildSettings')?.[interaction.guild.id]?.birthdayChannelId)
			return interaction.reply({
				content: 'Please set a Birthday Celebrate Channel first.',
				ephemeral: true
			});

		const [month, day, offset] = [
			Number(args.getString('month')),
			args.getInteger('day'),
			args.getString('timezone')
		];

		const userId = interaction.user.id;

		if (!dateIsValid(month, day))
			return interaction.reply({
				content: `Your input date is invalid.`,
				ephemeral: true
			});

		if (offset === EMPTYSTRING) {
			return interaction.reply({
				content: `Your input timezone is invalid.`,
				ephemeral: true
			});
		}

		const result = getNextBirthday(month, day, offset);

		if (result.errorFlag) {
			return interaction.reply({
				content: `We cannot find \`${offset}\`, because ${result.errorMsg}.`,
				ephemeral: true
			});
		}

		await interaction.deferReply({ ephemeral: true });
		const birthdayInform: BirthdayInform = {
			date: result.birthday,
			month: month.toString(),
			day: day.toString(),
			offset: offset
		};
		const birthdaySnap = doc(getFirestore(getApp()), 'Birthday', userId);
		const { error } = await awaitWrap(setDoc(birthdaySnap, birthdayInform));

		if (error)
			return interaction.followUp({
				content: 'Sorry, cannot connect with Database, please try again later.'
			});

		return interaction.followUp({
			content: `Your birthday date has been updated. Next birthday is <t:${result.birthday}:D>(<t:${result.birthday}:R>)`
		});
	}
});
