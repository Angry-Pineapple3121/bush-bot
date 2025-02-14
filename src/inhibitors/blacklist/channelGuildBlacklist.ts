import { BushCommand, BushInhibitor, BushMessage, BushSlashMessage } from '@lib';

export default class ChannelGuildBlacklistInhibitor extends BushInhibitor {
	public constructor() {
		super('channelGuildBlacklist', {
			reason: 'channelGuildBlacklist',
			category: 'blacklist',
			type: 'post',
			priority: 499
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage, command: BushCommand): Promise<boolean> {
		if (!message.author || !message.guild) return false;
		if (client.isOwner(message.author) || /* client.isSuperUser(message.author) || */ client.user!.id === message.author.id)
			return false;
		if (
			(await message.guild.getSetting('bypassChannelBlacklist'))?.includes(message.author.id) &&
			!command.bypassChannelBlacklist
		) {
			return false;
		}
		if (
			(await message.guild.getSetting('blacklistedChannels'))?.includes(message.channel!.id) &&
			!command.bypassChannelBlacklist
		) {
			return true;
		}
		return false;
	}
}
