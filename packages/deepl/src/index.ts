import { Translator } from 'deepl-node'
import type { SourceLanguageCode, TargetLanguageCode } from 'deepl-node'

export default class Node {
	#client: Translator

	constructor(authKey: string) {
		this.#client = new Translator(authKey, { maxRetries: 10, minTimeout: 25_000 })
	}

	public async translate(text: string, opts: {
		source_language: SourceLanguageCode;
		target_language: TargetLanguageCode;
	}) {
		if (text == '') return {
			character_usage: 0,
			translation: '',
		}

		const startUsage = await this.#client.getUsage()
		const result = await this.#client.translateText(text, opts.source_language, opts.target_language, {
			preserveFormatting: true,
			tagHandling: 'html',
		})
		const endUsage = await this.#client.getUsage()

		let characterUsage: number | undefined
		if (endUsage.character && startUsage.character) characterUsage = endUsage.character.count - startUsage.character.count

		return {
			character_usage: characterUsage,
			translation: result.text,
		}
	}
}
