import { BushListener } from '@lib';
import { MessageEmbed } from 'discord.js';
import { BushClientEvents } from '../../lib/extensions/discord.js/BushClientEvents';

export default class BushUpdateSettingsListener extends BushListener {
	public constructor() {
		super('bushUpdateSettings', {
			emitter: 'client',
			event: 'bushUpdateSettings',
			category: 'custom'
		});
	}

	public override async exec(
		...[setting, guild, oldSettings, newSettings, moderator]: BushClientEvents['bushUpdateSettings']
	): Promise<unknown> {
		const logChannel = await guild.getLogChannel('moderation');
		if (!logChannel) return;

		const logEmbed = new MessageEmbed().setColor(util.colors.discord.BLURPLE).setTimestamp();

		if (moderator)
			logEmbed.setAuthor(
				moderator.user.tag,
				moderator.user.avatarURL({ dynamic: true, format: 'png', size: 4096 }) ?? undefined
			);
		logEmbed.addField('**Action**', `${'Update Settings'}`);
		if (moderator) logEmbed.addField('**Moderator**', `${moderator} (${moderator.user.tag})`);
		logEmbed
			.addField('**Setting Changed**', setting)
			.addField('**Old Value**', await util.inspectCleanRedactCodeblock(oldSettings, 'js', undefined, 1024))
			.addField('**New Value**', await util.inspectCleanRedactCodeblock(newSettings, 'js', undefined, 1024));

		return await logChannel.send({ embeds: [logEmbed] });
	}
}
