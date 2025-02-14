import { AllowedMentions, BushCommand, BushMessage, BushSlashMessage } from '@lib';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import WolframAlphaAPI from 'wolfram-alpha-api';

export default class WolframAlphaCommand extends BushCommand {
	public constructor() {
		super('wolframAlpha', {
			aliases: ['wolfram-alpha', 'wolfram', 'alpha', 'wolf', 'wa'],
			category: 'utilities',
			description: {
				content: 'Queries Wolfram|Alpha for a result.',
				usage: 'wolfram-alpha <expression>',
				examples: ['wolfram-alpha what is the population of france']
			},
			args: [
				{
					id: 'expression',
					type: 'string',
					match: 'rest',
					prompt: {
						start: 'What would you like to look up?',
						retry: '{error} Pick something to look up.',
						optional: false
					}
				}
			],
			slash: true,
			slashOptions: [
				{
					name: 'expression',
					description: 'What would you like to look up?',
					type: 'STRING',
					required: true
				}
			],
			clientPermissions: ['SEND_MESSAGES'],
			userPermissions: ['SEND_MESSAGES']
		});
	}
	public override async exec(message: BushMessage | BushSlashMessage, args: { expression: string }): Promise<unknown> {
		if (message.util.isSlash) await (message.interaction as CommandInteraction).deferReply();

		const waApi = WolframAlphaAPI(client.config.credentials.wolframAlphaAppId);

		const decodedEmbed = new MessageEmbed().addField('📥 Input', await util.inspectCleanRedactCodeblock(args.expression));
		try {
			const calculated = await waApi.getShort(args.expression);
			decodedEmbed
				.setTitle(`${util.emojis.successFull} Successfully Queried Expression`)
				.setColor(util.colors.success)
				.addField('📤 Output', await util.inspectCleanRedactCodeblock(calculated.toString()));
		} catch (error) {
			decodedEmbed
				.setTitle(`${util.emojis.errorFull} Unable to Query Expression`)
				.setColor(util.colors.error)
				.addField(`📤 Error`, await util.inspectCleanRedactCodeblock(`${error.name}: ${error.message}`, 'js'));
		}
		return await message.util.reply({ embeds: [decodedEmbed], allowedMentions: AllowedMentions.none() });
	}
}
