import { AllowedMentions, BushCommand, BushMessage, BushSlashMessage } from '@lib';
import { MessageEmbed } from 'discord.js';
import { evaluate } from 'mathjs';

export default class CalculatorCommand extends BushCommand {
	public constructor() {
		super('calculator', {
			aliases: ['calculator', 'calc', 'math'],
			category: 'utilities',
			description: {
				content: 'Calculates math expressions.',
				usage: 'calculator <expression>',
				examples: ['calculator ']
			},
			args: [
				{
					id: 'expression',
					type: 'string',
					match: 'rest',
					prompt: {
						start: 'What would you like to evaluate?',
						retry: '{error} Pick something to evaluate.',
						optional: false
					}
				}
			],
			slash: true,
			slashOptions: [
				{
					name: 'expression',
					description: 'What would you like to evaluate?',
					type: 'STRING',
					required: true
				}
			],
			hidden: true,
			clientPermissions: ['SEND_MESSAGES'],
			userPermissions: ['SEND_MESSAGES']
		});
	}
	public override async exec(message: BushMessage | BushSlashMessage, args: { expression: string }): Promise<unknown> {
		const decodedEmbed = new MessageEmbed()
			.setTitle(`Calculator`)
			.addField('📥 Input', await util.inspectCleanRedactCodeblock(args.expression, 'mma'));
		try {
			const calculated = evaluate(args.expression);
			decodedEmbed
				.setColor(util.colors.success)
				.addField('📤 Output', await util.inspectCleanRedactCodeblock(calculated.toString(), 'mma'));
		} catch (error) {
			decodedEmbed
				.setColor(util.colors.error)
				.addField(`📤 Error Calculating`, await util.inspectCleanRedactCodeblock(`${error.name}: ${error.message}`, 'js'));
		}
		return await message.util.reply({ embeds: [decodedEmbed], allowedMentions: AllowedMentions.none() });
	}
}
