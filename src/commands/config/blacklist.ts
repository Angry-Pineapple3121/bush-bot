import { AllowedMentions, BushCommand, BushMessage, BushSlashMessage, Global } from '@lib';
import { Argument } from 'discord-akairo';
import { Channel, User } from 'discord.js';

export default class BlacklistCommand extends BushCommand {
	public constructor() {
		super('blacklist', {
			aliases: ['blacklist', 'unblacklist'],
			category: 'config',
			description: {
				content: 'A command to blacklist users and channels.',
				usage: 'blacklist|unblacklist <user|channel>',
				examples: ['blacklist @user', 'unblacklist #channel']
			},
			args: [
				{
					id: 'target',
					type: Argument.union('channel', 'user'),
					match: 'phrase',
					prompt: {
						start: 'What channel or user that you would like to blacklist/unblacklist?',
						retry: '{error} Pick a valid command.',
						optional: false
					}
				},
				{
					id: 'global',
					match: 'flag',
					flag: '--global'
				}
			],
			slash: true,
			slashOptions: [
				{
					name: 'action',
					description: 'Would you like to add or remove someone or something from/to the blacklist?',
					type: 'STRING',
					choices: [
						{
							name: 'blacklist',
							value: 'blacklist'
						},
						{
							name: 'unblacklist',
							value: 'unblacklist'
						}
					],
					required: true
				},
				{
					name: 'target',
					description: 'What channel or user that you would like to blacklist/unblacklist?',
					type: 'STRING',
					required: true
				}
			],
			channel: 'guild',
			clientPermissions: ['SEND_MESSAGES'],
			userPermissions: ['SEND_MESSAGES', 'MANAGE_GUILD']
		});
	}

	public async exec(
		message: BushMessage | BushSlashMessage,
		args: { action: 'blacklist' | 'unblacklist'; target: Channel | User | string; global: boolean }
	): Promise<unknown> {
		let action: 'blacklist' | 'unblacklist' | 'toggle' =
			args.action ?? (message?.util?.parsed?.alias as 'blacklist' | 'unblacklist') ?? 'toggle';
		const global = args.global && message.author.isOwner();
		const target =
			typeof args.target === 'string'
				? (await Argument.cast('channel', this.client.commandHandler.resolver, message as BushMessage, args.target)) ??
				  (await Argument.cast('user', this.client.commandHandler.resolver, message as BushMessage, args.target))
				: args.target;
		if (!target) return await message.util.reply(`${this.client.util.emojis.error} Choose a valid channel or user.`);
		const targetID = target.id;

		if (global) {
			if (action === 'toggle') {
				const blacklistedUsers = (await Global.findByPk(this.client.config.environment)).blacklistedUsers;
				const blacklistedChannels = (await Global.findByPk(this.client.config.environment)).blacklistedChannels;
				action = blacklistedUsers.includes(targetID) || blacklistedChannels.includes(targetID) ? 'unblacklist' : 'blacklist';
			}
			const success = await this.client.util
				.insertOrRemoveFromGlobal(
					action === 'blacklist' ? 'add' : 'remove',
					target instanceof User ? 'blacklistedUsers' : 'blacklistedChannels',
					targetID
				)
				.catch(() => false);
			if (!success)
				return await message.util.reply({
					content: `${this.client.util.emojis.error} There was an error globally **${action}ing** ${
						target?.tag ?? target.name
					}.`,
					allowedMentions: AllowedMentions.none()
				});
			else
				return await message.util.reply({
					content: `${this.client.util.emojis.success} Successfully **${action}ed** ${target?.tag ?? target.name} globally.`,
					allowedMentions: AllowedMentions.none()
				});
			// guild disable
		} else {
			const blacklistedChannels = (await message.guild.getSetting('blacklistedChannels')) ?? [];
			const blacklistedUsers = (await message.guild.getSetting('blacklistedUsers')) ?? [];
			if (action === 'toggle') {
				action = blacklistedChannels.includes(targetID) ?? blacklistedUsers.includes(targetID) ? 'unblacklist' : 'blacklist';
			}
			const newValue = this.client.util.addOrRemoveFromArray(
				action === 'blacklist' ? 'add' : 'remove',
				target instanceof User ? blacklistedUsers : blacklistedChannels,
				targetID
			);
			const success = await message.guild
				.setSetting(target instanceof User ? 'blacklistedUsers' : 'blacklistedChannels', newValue)
				.catch(() => false);
			if (!success)
				return await message.util.reply({
					content: `${this.client.util.emojis.error} There was an error **${action}ing** ${target?.tag ?? target.name}.`,
					allowedMentions: AllowedMentions.none()
				});
			else
				return await message.util.reply({
					content: `${this.client.util.emojis.success} Successfully **${action}ed** ${target?.tag ?? target.name}.`,
					allowedMentions: AllowedMentions.none()
				});
		}
	}
}
