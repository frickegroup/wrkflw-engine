import { AMQPClient } from '@cloudamqp/amqp-client'

interface AMPQ_MESSAGE<T> {
	message_id: string;
	message_content: T;
	message_timestamp: Date;
}

export default class Node {
	#client: AMQPClient

	constructor() {
		//TODO@alexanderniebuhr add connection url param
		this.#client = new AMQPClient('')
	}

	async connect() {
		await this.#client.connect()
	}

	async in<T extends object>(opts: {
		queue: string;
	}): Promise<AMPQ_MESSAGE<T> | undefined> {
		let value

		const AMQP_CHANNEL = await this.#client.channel()
		const AMQP_QUEUE = await AMQP_CHANNEL.queue(opts.queue)

		const AMQP_CONSUMER = await AMQP_QUEUE.subscribe({ noAck: true }, (msg) => {
			const message_id = msg.properties.messageId
			const message_timestamp = msg.properties.timestamp
			const message_content = JSON.parse(msg.bodyToString() ?? '{}') as T

			value = {
				message_id,
				message_content,
				message_timestamp,
			}

			AMQP_CONSUMER.cancel().then(() => { return }).catch(() => { return })
		})

		await AMQP_CONSUMER.wait()
		await AMQP_CHANNEL.close()

		return value
	}
}
