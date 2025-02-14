import { BushListener } from '@lib';
import CommandErrorListener from '../commands/commandError';

export default class UncaughtExceptionListener extends BushListener {
	public constructor() {
		super('uncaughtException', {
			emitter: 'process',
			event: 'uncaughtException'
		});
	}

	public override async exec(error: Error): Promise<void> {
		void client.console.error(
			'uncaughtException',
			`An uncaught exception occurred:\n${typeof error == 'object' ? error.stack : error}`,
			false
		);
		void client.console.channelError({
			embeds: [await CommandErrorListener.generateErrorEmbed({ type: 'uncaughtException', error: error })]
		});
	}
}
