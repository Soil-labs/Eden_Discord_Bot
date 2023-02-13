import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	EmbedBuilder,
	ForumChannel,
	InteractionReplyOptions,
	MessageCreateOptions
} from 'discord.js';
import { sprintf } from 'sprintf-js';

import { Button } from '../structures/Button';
import { ButtonCustomIdEnum } from '../types/Button';
import { LINK } from '../utils/const';
import { awaitWrap, getTagName, ParseMemberFromString } from '../utils/util';

export default new Button({
	customIds: [
		ButtonCustomIdEnum.NoInterest,
		ButtonCustomIdEnum.RefuseConnect,
		ButtonCustomIdEnum.AgreeToConnect
	],
	execute: async ({ interaction }) => {
		const { customId, message, channel } = interaction;
		const { mentions, content } = message;

		if (channel.type !== ChannelType.PublicThread) return;
		if (!mentions || mentions.members.size === 0) {
			return interaction.reply({
				content: 'Sorry, no invitee and inviter is found.',
				ephemeral: true
			});
		}
		if (mentions.members.size !== 2) {
			return interaction.reply({
				content: 'Sorry, more than two members are mentioned.',
				ephemeral: true
			});
		}

		const [inviterMember, inviteeMember] = ParseMemberFromString(content, interaction.guild);

		if (!inviterMember || !inviteeMember) {
			return interaction.reply({
				content: 'Sorry, parsing and fetching users failed.',
				ephemeral: true
			});
		}

		// if (interaction.user.id !== inviteeMember.id) {
		// 	return interaction.reply({
		// 		content: 'Sorry, you are not allowed to click this button.',
		// 		ephemeral: true
		// 	});
		// }

		const tagName = getTagName(channel.parent as ForumChannel, channel.appliedTags?.[0]);

		if (!tagName) {
			return interaction.reply({
				content: 'Sorry, this post does not include a tag.',
				ephemeral: true
			});
		}

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
		const commonEmbed = new EmbedBuilder().setTitle('Post Response Receipt');
		const [inviterName, inviteeName] = [inviterMember.displayName, inviteeMember.displayName];
		const inviteeDmTemplate = `**Post Type**: \`${tagName}\`\n**From**: \`${inviterName}\`\n\n%s.`;
		const inviterDmTemplate = `**Post Type**: \`${tagName}\`\n**From**: \`${inviteeName}\`\n\n%s.`;

		const inviteeDmMessage: MessageCreateOptions =
			customId === ButtonCustomIdEnum.NoInterest
				? {
						embeds: [
							commonEmbed.setDescription(
								sprintf(
									inviteeDmTemplate,
									`Thanks for using Eden bot, we ensure \`${inviterName}\` won' bother you again. Meanwhile, the correponding post is about to be closed. You can access the post by clicking the button`
								)
							)
						]
				  }
				: customId === ButtonCustomIdEnum.RefuseConnect
				? {
						embeds: [
							commonEmbed.setDescription(
								sprintf(
									inviteeDmTemplate,
									`Thanks for using Eden bot, you have refused this inviter. We ensure \`${inviterName}\` won' bother you again. Meanwhile, the correponding post is about to be closed. You can access the post by clicking the button`
								)
							)
						]
				  }
				: {
						embeds: [
							commonEmbed.setDescription(
								sprintf(
									inviteeDmTemplate,
									`Thanks for using Eden bot and connecting to \`${inviterName}\`, we hope you can secure what you want through this talk. You can access the post by clicking the button`
								)
							)
						]
				  };
		const inviterDmMessage: MessageCreateOptions =
			customId === ButtonCustomIdEnum.NoInterest
				? {
						embeds: [
							commonEmbed.setDescription(
								sprintf(
									inviterDmTemplate,
									`Thanks for using Eden bot, \`${inviteeName}\` has no interest in your invitation. Meanwhile, the correponding post is about to be closed. You can access the post by clicking the button`
								)
							)
						]
				  }
				: customId === ButtonCustomIdEnum.RefuseConnect
				? {
						embeds: [
							commonEmbed.setDescription(
								sprintf(
									inviterDmTemplate,
									`Thanks for using Eden bot, \`${inviteeName}\` has refused your invite and you are not allowed to send further invitation either. Meanwhile, the correponding post is about to be closed. You can access the post by clicking the button`
								)
							)
						]
				  }
				: {
						embeds: [
							commonEmbed.setDescription(
								sprintf(
									inviterDmTemplate,
									`Thanks for using Eden bot, congrats! \`${inviteeName}\` is willing to talk with you. You can access the post by clicking the button`
								)
							)
						]
				  };

		inviteeDmMessage.components = [PostLinkButtonComponent];
		inviterDmMessage.components = [PostLinkButtonComponent];
		await interaction.deferReply({ ephemeral: true });
		const { result: inviteeDmChannel } = await awaitWrap(inviteeMember.createDM());
		const { result: inviterDmChannel } = await awaitWrap(inviterMember.createDM());
		const dmIndicator = {
			isInviteeDmClose: false,
			isInviterDmClose: false
		};

		if (inviteeDmChannel) {
			const { error } = await awaitWrap(inviteeDmChannel.send(inviteeDmMessage));

			dmIndicator.isInviteeDmClose = error ? true : false;
		}
		if (inviterDmChannel) {
			const { error } = await awaitWrap(inviterDmChannel.send(inviterDmMessage));

			dmIndicator.isInviterDmClose = error ? true : false;
		}

		const contentMap: Array<[typeof dmIndicator, InteractionReplyOptions]> = [
			[
				{
					isInviteeDmClose: false,
					isInviterDmClose: false
				},
				{
					content: `DM has been sent to you and <@${inviterMember.id}>.`
				}
			],
			[
				{
					isInviteeDmClose: true,
					isInviterDmClose: false
				},
				{
					content: `DM has been sent to <@${inviterMember.id}>`,
					embeds: inviteeDmMessage.embeds
				}
			],
			[
				{
					isInviteeDmClose: false,
					isInviterDmClose: true
				},
				{
					content: 'DM has been sent to you.'
				}
			],
			[
				{
					isInviteeDmClose: true,
					isInviterDmClose: true
				},
				{
					embeds: inviteeDmMessage.embeds
				}
			]
		];

		if (dmIndicator.isInviterDmClose) {
			await channel.send({
				content: `<@${inviterMember.id}>`,
				embeds: inviterDmMessage.embeds
			});
		}

		await interaction.followUp(
			[...contentMap].filter(
				(value) =>
					value[0].isInviteeDmClose === dmIndicator.isInviteeDmClose &&
					value[0].isInviterDmClose === dmIndicator.isInviterDmClose
			)[0][1]
		);

		await interaction.followUp({
			embeds: [
				new EmbedBuilder()
					.setTitle('Post Status Indicator')
					.setDescription(`Current post status: \`${interaction.component.label}\``)
			]
		});

		if (customId !== ButtonCustomIdEnum.AgreeToConnect) {
			await channel.setArchived(true);
		}
		return;
	}
});
