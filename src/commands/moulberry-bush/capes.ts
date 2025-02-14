import { MessageEmbed } from 'discord.js';
import got from 'got';
import { BushCommand, BushMessage } from '../../lib';

export interface GithubFile {
	path: string;
	mode: string;
	type: string;
	sha: string;
	size: number;
	url: string;
}

export interface GithubBlob {
	encoding: string;
	content: string;
	sha: string;
	node_id: string;
	url: string;
	size: number;
}

export interface GithubTreeApi {
	sha: string;
	url: string;
	tree: GithubFile[];
	truncated: boolean;
}

export default class CapesCommand extends BushCommand {
	public constructor() {
		super('capes', {
			aliases: ['capes', 'cape'],
			category: "Moulberry's Bush",
			description: {
				content: 'A command to see what a cape looks like.',
				usage: 'cape [cape]',
				examples: ['capes', 'cape space']
			},
			args: [
				{
					id: 'cape',
					type: 'string',
					prompt: {
						start: 'What cape would you like to see?',
						retry: '{error} Choose a cape to see.',
						optional: true
					},
					default: null
				}
			],
			slash: true,
			slashOptions: [
				{
					name: 'cape',
					description: 'What cape would you like to see?',
					type: 'STRING',
					required: false
				}
			],
			clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES'],
			userPermissions: ['SEND_MESSAGES']
		});
	}

	public override async exec(message: BushMessage, args: { cape: string | null }): Promise<void> {
		const { tree: neuFileTree }: GithubTreeApi = await got
			.get('https://api.github.com/repos/Moulberry/NotEnoughUpdates/git/trees/master?recursive=1')
			.json();
		const capes = neuFileTree
			.map((f) => ({
				match: f.path.match(/src\/main\/resources\/assets\/notenoughupdates\/capes\/(?<name>\w+)_preview\.png/),
				f
			}))
			.filter((f) => f.match !== null);

		const capes1: { name: string; url: string; index: number; purchasable?: boolean }[] = [];
		client.consts.mappings.capes.forEach((mapCape) => {
			if (!capes.some((gitCape) => gitCape.match!.groups!.name === mapCape.name) && mapCape.custom) {
				capes1.push({ name: mapCape.name, url: mapCape.custom, index: mapCape.index, purchasable: mapCape.purchasable });
			}
		});
		capes.forEach((gitCape) => {
			const mapCape = client.consts.mappings.capes.find((a) => a.name === gitCape.match!.groups!.name);
			const url = mapCape?.custom ?? `https://github.com/Moulberry/NotEnoughUpdates/raw/master/${gitCape.f.path}`;
			const index = mapCape?.index !== undefined ? mapCape.index : null;
			capes1.push({ name: gitCape.match!.groups!.name, url, index: index!, purchasable: mapCape?.purchasable });
		});

		const sortedCapes = capes1.sort((a, b) => {
			let aWeight: number | undefined = undefined,
				bWeight: number | undefined = undefined;
			aWeight ??= a?.index;
			bWeight ??= b?.index;

			if (aWeight !== undefined && bWeight !== undefined) {
				return aWeight - bWeight;
			} else if (aWeight === undefined) {
				return 1;
			} else if (bWeight === undefined) {
				return -1;
			}
			return 0;
		});
		if (args.cape) {
			const capeObj = sortedCapes.find((s_cape) => s_cape.name === args.cape);
			if (capeObj) {
				const embed = new MessageEmbed({
					title: `${capeObj.name} cape`,
					color: util.colors.default
				}).setTimestamp();
				embed.setImage(capeObj.url);
				await util.sendWithDeleteButton(message, { embeds: [embed] });
			} else {
				await message.util.reply(`${util.emojis.error} Cannot find a cape called \`${args.cape}\`.`);
			}
		} else {
			const embeds = [];
			for (const capeObj of sortedCapes) {
				const embed = new MessageEmbed({
					title: `${capeObj.name} cape`,
					color: util.colors.default
				}).setTimestamp();
				embed.setImage(capeObj.url);
				if (capeObj.purchasable) embed.setDescription(':money_with_wings: **purchasable** :money_with_wings:');
				embeds.push(embed);
			}
			await util.buttonPaginate(message, embeds, null);
		}
	}
}
