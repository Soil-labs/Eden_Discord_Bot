import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	Message,
	MessageCreateOptions
} from 'discord.js';
import { sprintf } from 'sprintf-js';

import { Button } from '../structures/Button';
import { ButtonCustomIdEnum } from '../types/Button';
import { LINK } from '../utils/const';
import { awaitWrap } from '../utils/util';

export default new Button({
	customIds: [
		ButtonCustomIdEnum.NoInterest,
		ButtonCustomIdEnum.RefuseConnect,
		ButtonCustomIdEnum.AgreeToConnect
	],
	execute: async ({ interaction }) => {
		const { customId, message, channel, user } = interaction;
		const { mentions } = message;

		if (channel.type !== ChannelType.PublicThread) return;

		if (mentions.parsedUsers.size === 0) {
			return interaction.reply({
				content: 'Sorry, no invitee and inviter is found.',
				ephemeral: true
			});
		}
		if (mentions.parsedUsers.size !== 2) {
			return interaction.reply({
				content: 'Sorry, more than two members are mentioned.',
				ephemeral: true
			});
		}
		const [inviterUser, inviteeUser] = Array.from(mentions.parsedUsers.values());

		// todo remember to resume this
		// if (user.id !== inviteeUser.id) {
		// 	return interaction.reply({
		// 		content: 'Sorry, you are not allowed to click this button.',
		// 		ephemeral: true
		// 	});
		// }

		const componentFirstArray = message.components[0].toJSON();

		componentFirstArray.components.forEach((button) => {
			button.disabled = true;
		});
		await message.edit({
			content: message.content,
			embeds: message.embeds,
			components: [componentFirstArray]
		});

		const PostLinkButtonComponent = new ActionRowBuilder<ButtonBuilder>().addComponents([
			new ButtonBuilder()
				.setLabel('Link to the post')
				.setStyle(ButtonStyle.Link)
				.setURL(
					sprintf(LINK.THREAD, {
						guildId: interaction.guildId,
						threadId: channel.id
					})
				)
				.setEmoji('🔗')
		]);
		const inviteeDmMessage: MessageCreateOptions =
			customId === ButtonCustomIdEnum.NoInterest
				? {
						content: `Thanks for using Eden bot, we ensure \`${inviterUser.username}\` won' bother you again. Meanwhile, the correponding post is about to be closed. You can access the post by clicking the button.`
				  }
				: customId === ButtonCustomIdEnum.RefuseConnect
				? {
						content: `Thanks for using Eden bot, you have refused this inviter. We ensure \`${inviterUser.username}\` won' bother you again. Meanwhile, the correponding post is about to be closed. You can access the post by clicking the button.`
				  }
				: {
						content: `Thanks for using Eden bot and connecting to \`${inviterUser.username}\`, we hope you can secure what you want through this talk. You can access the post by clicking the button.`
				  };
		const inviterDmMessage: MessageCreateOptions =
			customId === ButtonCustomIdEnum.NoInterest
				? {
						content: `Thanks for using Eden bot, \`${inviteeUser.username}\` has no interest in your invitation. Meanwhile, the correponding post is about to be closed. You can access the post by clicking the button.`
				  }
				: customId === ButtonCustomIdEnum.RefuseConnect
				? {
						content: `Thanks for using Eden bot, \`${inviteeUser.username}\` has refused your invite and you are not allowed to send further invitation either. Meanwhile, the correponding post is about to be closed. You can access the post by clicking the button.`
				  }
				: {
						content: `Thanks for using Eden bot, congrats! \`${inviteeUser.username}\` is willing to talk with you. You can access the post by clicking the button.`
				  };

		inviteeDmMessage.components = [PostLinkButtonComponent];
		inviterDmMessage.components = [PostLinkButtonComponent];
		await interaction.deferReply({ ephemeral: true });
		const { result: inviteeDmChannel } = await awaitWrap(inviterUser.createDM());
		const { result: inviterDmChannel } = await awaitWrap(inviteeUser.createDM());
		const promiseArray: Array<Promise<Message>> = [];
		const dmIndicator = {
			inviteeDM: false,
			inviterDM: false
		};

		if (inviteeDmChannel) {
			promiseArray.push(inviteeDmChannel.send(inviteeDmMessage));
			dmIndicator.inviteeDM = true;
		}
		if (inviterDmChannel) {
			promiseArray.push(inviterDmChannel.send(inviterDmMessage));
			dmIndicator.inviterDM = true;
		}
		if (promiseArray.length !== 0) {
			await Promise.all(promiseArray);
		}

		const contentMap: Array<
			[
				{
					inviteeDM: boolean;
					inviterDM: boolean;
				},
				string
			]
		> = [
			[
				{
					inviteeDM: true,
					inviterDM: true
				},
				`DM have been sent to you and <@${inviterUser.id}>.`
			],
			[
				{
					inviteeDM: false,
					inviterDM: true
				},
				`DM has been sent to <@${inviterUser.id}>.\n${inviteeDmMessage.content}`
			],
			[
				{
					inviteeDM: true,
					inviterDM: false
				},
				`DM has been sent to you.`
			],
			[
				{
					inviteeDM: false,
					inviterDM: false
				},
				`${inviteeDmMessage.content}`
			]
		];

		if (!dmIndicator.inviterDM) {
			await channel.send({
				content: `<@${inviterUser.id}>\n${inviterDmMessage}`
			});
		}

		await interaction.followUp({
			content: [...contentMap].filter(
				(value) =>
					value[0].inviteeDM === dmIndicator.inviteeDM &&
					value[0].inviterDM === dmIndicator.inviterDM
			)[0][1]
		});

		if (customId !== ButtonCustomIdEnum.AgreeToConnect) {
			await channel.setArchived(true);
		}
		return;
	}
});
