import { AMQPClient } from '@cloudamqp/amqp-client'

interface AMPQ_MESSAGE<T> {
	message_id: string;
	message_content: T;
	message_timestamp: Date;
}

export default class Node {
	#client: AMQPClient

	/**
	 *
	 * @param url connection url as string
	 */
	constructor(url: string) {
		//TODO@alexanderniebuhr add connection url param
		this.#client = new AMQPClient(url)
	}

	async connect() {
		await this.#client.connect()
	}

	async in<T extends object>(opts: {
		queue: string;
	}): Promise<AMPQ_MESSAGE<T> | undefined> {
		let value

		const AMQP_CHANNEL = await this.#client.channel()
		await AMQP_CHANNEL.basicQos(1, undefined, true)

		const AMQP_CONSUMER = await AMQP_CHANNEL.basicConsume(opts.queue, {noAck: false, tag: opts.queue}, (msg) => {
			const message_id = msg.properties.messageId
			const message_timestamp = msg.properties.timestamp
			const message_content = JSON.parse(msg.bodyToString() ?? '{}') as T

			value = {
				message_id,
				message_content,
				message_timestamp,
			}

			void AMQP_CHANNEL.basicCancel(opts.queue)
		})

		await AMQP_CONSUMER.wait()
		await AMQP_CHANNEL.basicAck(1, false)

		await AMQP_CHANNEL.close()

		return value
	}
}
