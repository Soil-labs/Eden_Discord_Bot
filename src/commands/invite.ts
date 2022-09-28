import { MessageEmbed } from 'discord.js';
import { sprintf } from 'sprintf-js';
import { addNewMember } from '../graph/mutation/addNewMember.mutation';
import { Command } from '../structures/Command';
import { CONTENT, LINK } from '../utils/const';
import {
	awaitWrap,
	checkTextChannelPermission,
	getErrorReply,
	updateMemberCache,
	validMember
} from '../utils/util';

export default new Command({
	name: 'invite',
	description: 'Invite a fren to join Eden 🌳',
	options: [
		{
			type: 'USER',
			description: "The member you'd like to support",
			name: 'fren',
			required: true
		}
	],
	execute: async ({ interaction, args }) => {
		const invitee = args.getUser('fren');
		const inviter = interaction.user;
		const guildId = interaction.guild.id;

		if (invitee.id === inviter.id)
			return interaction.reply({
				content: 'Sorry, you cannot invite yourself.',
				ephemeral: true
			});

		if (invitee.bot)
			return interaction.reply({
				content: 'Sorry, you cannot invite a bot to Eden 🌳.',
				ephemeral: true
			});
		const isNewInviter = validMember(inviter.id, guildId);
		if (!isNewInviter) {
			await interaction.deferReply({ ephemeral: true });

			const [_, inviteError] = await addNewMember({
				fields: {
					_id: inviter.id,
					discordName: inviter.username,
					discriminator: inviter.discriminator,
					discordAvatar: inviter.displayAvatarURL(),
					invitedBy: inviter.id,
					serverID: guildId
				}
			});

			if (inviteError)
				return interaction.followUp({
					content: getErrorReply({
						commandName: interaction.commandName,
						errorMessage: inviteError
					})
				});

			updateMemberCache({
				userId: inviter.id,
				name: inviter.username,
				guildId: guildId
			});
		}

		if (!interaction.deferred) await interaction.deferReply({ ephemeral: true });

		const [result, error] = await addNewMember({
			fields: {
				_id: invitee.id,
				discordName: invitee.username,
				discriminator: invitee.discriminator,
				discordAvatar: invitee.displayAvatarURL(),
				invitedBy: inviter.id,
				serverID: guildId
			}
		});

		if (error)
			return interaction.followUp({
				content: getErrorReply({
					commandName: interaction.commandName,
					errorMessage: error
				})
			});

		updateMemberCache({
			userId: invitee.id,
			name: invitee.username,
			guildId: guildId
		});

		let embedContent = new MessageEmbed().setTitle("You've been invited to join Eden 🌳");
		if (process.env.MODE === 'prod' && !process.env.DMALLOWED) {
			// const { result, error } = await awaitWrap(interaction.channel.send({
			//     content: `<@${inviter.id}> has invited <@${invitee.id}> to join Eden 🌳! BIG WAGMI ENERGY!⚡`,
			//     embeds: [
			//         embedContent.setDescription(sprintf(CONSTANT.CONTENT.INVITE_DM_FAIL, {
			//             onboardLink: CONSTANT.LINK.SIGNUP,
			//             inviteeId: invitee.id
			//         }))
			//     ]
			// }));
			// if (error) return interaction.followUp({
			//     content: "Cannot send message in this channel, please check the permission. But you have been onboarded!"
			// })

			return interaction.followUp({
				content: 'Congrates, you have onboarded your fren!'
			});
		}
		const DMchannel = await invitee.createDM();

		const { result: dmResult, error: dmError } = await awaitWrap(
			DMchannel.send({
				embeds: [
					embedContent.setDescription(
						sprintf(CONTENT.INVITE_DM, {
							onboardLink: LINK.SIGNUP,
							inviterId: inviter.id
						})
					)
				]
			})
		);

		if (dmError) {
			const permissionCheck = checkTextChannelPermission(
				interaction.channel,
				interaction.guild.me.id
			);
			if (!permissionCheck) {
				await interaction.channel.send({
					content: `<@${inviter.id}> has invited <@${invitee.id}> to join Eden 🌳! BIG WAGMI ENERGY!⚡`,
					embeds: [
						embedContent.setDescription(
							sprintf(CONTENT.INVITE_DM_FAIL, {
								onboardLink: LINK.SIGNUP,
								inviteeId: invitee.id
							})
						)
					]
				});

				return interaction.followUp({
					content: sprintf(
						'Invite message has been sent to <#%s>',
						interaction.channel.id
					)
				});
			} else {
				return interaction.followUp({
					content:
						`Invitee does not open the DM and I cannot send the invite link to this channel: ${permissionCheck}`
				});
			}
		}
		return interaction.followUp({
			embeds: [
				new MessageEmbed()
					.setTitle("We've sent your friend a DM 🌳")
					.setDescription(
						'Growing the garden of opportunities is how we are all going to make it.❤️'
					)
			]
		});
	}
});
