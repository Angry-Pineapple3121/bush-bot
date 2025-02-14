import { AkairoMessage } from 'discord-akairo';
import { CommandInteraction } from 'discord.js';
import { BushGuild } from '../discord.js/BushGuild';
import { BushGuildMember } from '../discord.js/BushGuildMember';
import { BushUser } from '../discord.js/BushUser';
import { BushClient } from './BushClient';
import { BushCommandUtil } from './BushCommandUtil';

export class BushSlashMessage extends AkairoMessage {
	public declare client: BushClient;
	public declare util: BushCommandUtil;
	public declare author: BushUser;
	public declare member: BushGuildMember | null;
	public constructor(client: BushClient, interaction: CommandInteraction) {
		super(client, interaction);
	}

	public override get guild(): BushGuild | null {
		return super.guild as BushGuild | null;
	}
}
