import { AMQPClient } from '@cloudamqp/amqp-client'

interface MESSAGE<T> {
	delivery_tag?: number;
	message_id: string;
	message_timestamp: Date;
	message_content: T;
}

export default class Node {
	#client: AMQPClient

	/**
	 *
	 * @param url connection url as string
	 */
	constructor(url: string) {
		this.#client = new AMQPClient(url)
	}

	async connect() {
		await this.#client.connect()
	}

	async close() {
		await this.#client.close()
	}

	async ack(opts: {
		channel: number;
		delivery_tag: number;
	}) {
		const AMQP_CHANNEL = await this.#client.channel(opts.channel)
		await AMQP_CHANNEL.basicAck(opts.delivery_tag, false)
	}

	async reject(opts: {
		channel: number;
		delivery_tag: number;
	}) {
		const AMQP_CHANNEL = await this.#client.channel(opts.channel)
		await AMQP_CHANNEL.basicNack(opts.delivery_tag, true, false)
	}

	async listen<T extends object | string>(opts: {
		channel: number;
		queue: string;
		parallel: number;
	}, callback: (msg: MESSAGE<T | string>) => Promise<void> | void) {
		const AMQP_CHANNEL = await this.#client.channel(opts.channel)
		await AMQP_CHANNEL.basicQos(opts.parallel, undefined, true)

		const AMQP_CONSUMER = await AMQP_CHANNEL.basicConsume(opts.queue, { noAck: false, tag: opts.queue }, (msg) => {
			const message_id = msg.properties.messageId
			const delivery_tag = msg.deliveryTag
			const message_timestamp = msg.properties.timestamp
			const message_content = (msg.properties.contentType == 'application/json') ? JSON.parse(msg.bodyToString() ?? '{}') as T : msg.bodyToString()

			if (message_id == undefined) throw new Error('message_id cannot be undefined, please set it on publish')
			if (message_timestamp == undefined) throw new Error('message_timestamp cannot be undefined, please set it on publish')
			if (message_content == undefined) throw new Error('message_timestamp cannot be undefined, please set it on publish')

			void callback({
				message_id,
				delivery_tag,
				message_content,
				message_timestamp,
			})
		})

		await AMQP_CONSUMER.wait()
	}

	async in<T extends object | string>(opts: {
		queue: string;
	}): Promise<MESSAGE<T>> {
		let value

		const AMQP_CHANNEL = await this.#client.channel()
		await AMQP_CHANNEL.basicQos(1, undefined, true)

		const AMQP_CONSUMER = await AMQP_CHANNEL.basicConsume(opts.queue, { noAck: false, tag: opts.queue }, (msg) => {
			const message_id = msg.properties.messageId
			const delivery_tag = msg.deliveryTag
			const message_timestamp = msg.properties.timestamp
			const message_content = (msg.properties.contentType == 'application/json') ? JSON.parse(msg.bodyToString() ?? '{}') as T : msg.bodyToString()

			if (message_id == undefined) throw new Error('message_id cannot be undefined, please set it on publish')
			if (message_timestamp == undefined) throw new Error('message_timestamp cannot be undefined, please set it on publish')
			if (message_content == undefined) throw new Error('message_timestamp cannot be undefined, please set it on publish')

			value = {
				delivery_tag,
				message_id,
				message_content,
				message_timestamp,
			}

			void AMQP_CHANNEL.basicCancel(opts.queue)
		})

		await AMQP_CONSUMER.wait()
		await AMQP_CHANNEL.basicAck(1, false)

		await AMQP_CHANNEL.close()

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (value == undefined) throw new Error('issue receiving message')

		return value
	}

	async out(opts: {
		routing_key: string;
	}, data: {
		message_id: string;
		content: object;
	} | {
		message_id: string;
		content: object;
	}[]): Promise<string | string[]> {
		// check if data is array
		const is_array = Array.isArray(data)
		const AMQP_CHANNEL = await this.#client.channel()
		if (!is_array) {
			const message_id = data.message_id
			await AMQP_CHANNEL.basicPublish('amq.direct', opts.routing_key, JSON.stringify(data.content), { messageId: message_id, timestamp: new Date(), deliveryMode: 2, contentType: 'application/json' })
			await AMQP_CHANNEL.close()

			return message_id
		} else {
			const promises = []
			for (const [i, v] of data.entries()) {
				const message_id = `${v.message_id}_${i}`
				promises.push(AMQP_CHANNEL.basicPublish('amq.direct', opts.routing_key, JSON.stringify(v.content), { messageId: message_id, timestamp: new Date(), deliveryMode: 2, contentType: 'application/json' }).then(() => { return message_id }))
			}
			const message_ids = await Promise.all<string>(promises)
			await AMQP_CHANNEL.close()

			return message_ids
		}
	}
}
