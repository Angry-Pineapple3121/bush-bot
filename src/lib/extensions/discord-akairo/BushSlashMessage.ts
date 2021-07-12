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
	public declare guild: BushGuild;
	public declare author: BushUser;
	public declare member: BushGuildMember;
	public constructor(
		client: BushClient,
		interaction: CommandInteraction,
		{ slash, replied }: { slash?: boolean; replied?: boolean }
	) {
		super(client, interaction, { slash, replied });
	}
}
