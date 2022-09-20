import { AMQPClient } from '@cloudamqp/amqp-client'

export default class Node {
	constructor() {
		//
		console.log('Node constructor')
	}
}

// await new AMQPClient(process.env.AMQP_URL!).connect()

// const AMQP_CHANNEL = await ctx.amqp.channel()
// const AMQP_QUEUE = await AMQP_CHANNEL.queue('translation_splitting')
// const AMQP_SUBSCRIBER = await AMQP_QUEUE.subscribe({}, async (msg) => {
// 	const data = JSON.parse(msg.bodyToString() ?? '{}')
// 	callback({
// 		type: 'RECEIVED_SPLITTING_TASK',
// 		data: data,
// 	})
// 	await AMQP_SUBSCRIBER.cancel()
// })
// await AMQP_SUBSCRIBER.wait()

// return () => { AMQP_CHANNEL.close() }
