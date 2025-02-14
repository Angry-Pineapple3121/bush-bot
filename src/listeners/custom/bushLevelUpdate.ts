import { Formatters, TextChannel } from 'discord.js';
import { BushListener } from '../../lib';
import { BushClientEvents } from '../../lib/extensions/discord.js/BushClientEvents';

export default class BushLevelUpdateListener extends BushListener {
	public constructor() {
		super('bushLevelUpdate', {
			emitter: 'client',
			event: 'bushLevelUpdate',
			category: 'custom'
		});
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public override async exec(...[member, oldLevel, newLevel, currentXp, message]: BushClientEvents['bushLevelUpdate']) {
		if (await message.guild.hasFeature('sendLevelUpMessages')) {
			void (async () => {
				const channel = ((await message.guild.channels
					.fetch((await message.guild.getSetting('levelUpChannel')) ?? message.channelId)
					.catch(() => null)) ?? message.channel) as TextChannel;

				const success = await channel
					.send(
						`${Formatters.bold(util.sanitizeWtlAndControl(member.user.tag))} leveled up to level ${Formatters.bold(
							`${newLevel}`
						)}.`
					)
					.catch(() => null);

				if (!success) await client.console.warn('bushLevelUpdate', `Could not send level up message in ${message.guild}`);
			})();
		}
	}
}
