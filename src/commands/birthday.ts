import { getApp } from 'firebase/app';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import { myCache } from '../structures/Cache';
import { Command } from '../structures/Command';
import { BirthdayInform } from '../types/Cache';
import { MONTH_ENUM } from '../utils/const';
import { awaitWrap, getNextBirthday } from '../utils/util';

export default new Command({
	name: 'birthday',
	description: 'Tell me your birthday and we celebrate togather!',
	options: [
		{
			name: 'month',
			description: 'Your birthday month',
			type: 'STRING',
			required: true,
			choices: MONTH_ENUM
		},
		{
			name: 'day',
			description: 'Your birthday day',
			type: 'INTEGER',
			required: true
		},
		{
			name: 'timezone',
			description: 'Choose your timezone',
			type: 'INTEGER',
			required: true,
			autocomplete: true
		}
	],
	execute: async ({ interaction, args }) => {
		if (!myCache.myHas('GuildSettings'))
			return interaction.reply({
				content: 'Guild is initing, please try again later.',
				ephemeral: true
			});

		if (!myCache.myGet('GuildSettings')[interaction.guild.id]?.birthdayChannelId)
			return interaction.reply({
				content: 'Please set a Birthday Celebrate Channel first.',
				ephemeral: true
			});

		const [month, day, offset] = [
			Number(args.getString('month')),
			args.getInteger('day'),
			args.getInteger('timezone')
		];

		const userId = interaction.user.id;
		// todo how to validate
		// if (!isValidDate(month, day))
		// 	return interaction.reply({
		// 		content: `Your input \`${month}-${day}\` is a invalid date.`,
		// 		ephemeral: true
		// 	});

		if (isNaN(offset)) {
			return interaction.reply({
				content: `Your input \`timezone\` is invalid.`,
				ephemeral: true
			});
		}

		const birthdayDateInSec = getNextBirthday(month, day, offset);

		await interaction.deferReply({ ephemeral: true });
		const birthdayInform: BirthdayInform = {
			date: birthdayDateInSec,
			month: month.toString(),
			day: day.toString(),
			offset: offset
		};
		const birthdaySnap = doc(getFirestore(getApp()), 'Birthday', userId);
		const { result, error } = await awaitWrap(setDoc(birthdaySnap, birthdayInform));

		if (error)
			return interaction.followUp({
				content: 'Sorry, cannot connect with Database, please try again later.'
			});

		return interaction.followUp({
			content: `Your birthday date has been updated. Next birthday is <t:${birthdayDateInSec}:D>(<t:${birthdayDateInSec}:R>)`
		});
	}
});
