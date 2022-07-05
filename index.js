require('dotenv').config()
const advcash = require('advcash');
const { default: axios } = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const W3CWebSocket = require('websocket').w3cwebsocket;





const bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true});
const client = new W3CWebSocket('wss://stream.binance.com:9443/stream?streams=usdtrub@miniTicker');





bot.onText(/\/start/, (msg) => {
	checking(bot, msg.chat.id); 
});

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id, `Я на начальной стадии развития поэтому обратись к моему создателю, он 100% тебе поможет. \n@MaxVonRosenhof`);
});





function checking(bot, chatId) {
	bot.sendMessage(chatId,`Введите секретный ключ, пожалуйста. \nPS. \nЕсли ключ не верный то Вы получите в ответ ничего.`);
	const regexp = new RegExp(`${process.env.KEY}`, 'g');
	bot.onText(regexp, async (msg) => {
		try {
			const request = await axios.post('https://610b9ecc2b6add0017cb399f.mockapi.io/bot-users', {
				chat_id: msg.chat.id,
				first_name: msg.chat.first_name,
				username: msg.chat.username,
				date: msg.date,
			});
			console.log('Success', {
				status: request.status, statusText: request.statusText
			});
			await bot.sendMessage(chatId,`Вы успешно зарегистрировались на рассылку.`);
			startBotWork(msg);
		} catch(e) {
			console.log('Error', e);
			bot.sendMessage(chatId,`Упс, что-то пошло не так. \nВоспользуйтесь командой /help`);
		}
	});
}

async function startBotWork(msg) {
	const chatId = msg.chat.id;
	await bot.sendMessage(chatId, `${msg.chat.first_name}, я буду давать тебе сигнал когда и что покупать/продавать !`);
	await bot.sendMessage(chatId, `Сообщение будет выглядеть вот так =>`);
	await bot.sendMessage(chatId, `Разница(AdvCash > Binance): ......... \nЦена на AdvCahs: ........ \nЦена на Binance: ........ \nВремя: ........`);
	await bot.sendMessage(chatId, `Используй /start чтобы перезапустить и /help чтобы попросить помощь`);
	startLogic(chatId);
}

async function startLogic(chatId) {
	client.onmessage = async function(event) {
		try {
			const binanceValue = JSON.parse(event.data);
			const advcashValue = await getCurrencyValueAdvcash("USDT_TRC20", "RUR", "SELL", 1.00);
			const result = advcashValue.rate - binanceValue.data.c;
			const request = await axios.get('https://610b9ecc2b6add0017cb399f.mockapi.io/bot-users');
			if (request.data.some(el => el.chat_id === chatId)) {
				if(result >= 0.15) {
					const obj = {
						advcashPrice: advcashValue.rate,
						binancePrice: binanceValue.data.c,
						date: binanceValue.data.E,
						result: result
					};
					bot.sendMessage(chatId, `Разница(AdvCash > Binance): ${obj.result} \nЦена на AdvCahs: ${obj.advcashPrice} \nЦена на Binance: ${obj.binancePrice} \nВремя: ${obj.date}`);
				}
			} else {
				bot.sendMessage(chatId, `Кажеться Вас нету в списке пользователей. \nВоспользуйтесь командой /help`);
			}
		} catch(e) {
			console.log(e);
			bot.sendMessage(chatId, `Упс, что-то пошло не так. \nВоспользуйтесь командой /help`);
		}
	};
	client.onerror = function() {
		console.log('There was an ERROR!');
	};
	client.onopen = function() {
		console.log('The connection was opened');
	};
	client.onclose = function() {
		console.log('The connection was closed');
	};
}

async function getCurrencyValueAdvcash(fromValue, toValue, type, amountValue) {
	try {
		const request = await advcash({
			password: process.env.PASSWORD_API,
			apiName: process.env.API_NAME,
			accountEmail: process.env.ACCOUNT_EMAIL
		});
		const response = await request.checkCurrencyExchange({
			from: fromValue,
			to: toValue,
			action: type,
			amount: amountValue
		});
		const result = await response;
		return result;
	} catch(e) {
		console.log('THERE WAS AN ERROR!!!!', e);
	}
}