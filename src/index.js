require('dotenv').config()
const advcash = require('advcash');
const TelegramBot = require('node-telegram-bot-api');
const W3CWebSocket = require('websocket').w3cwebsocket;
const client = new W3CWebSocket('wss://stream.binance.com:9443/stream?streams=usdtrub@miniTicker');

const bot = new TelegramBot("5466187776:AAHBMcTyg552dhgB4GRVKwoPrQHXDwk9wWI", {polling: true});

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId, `Шалом, ${msg.chat.first_name}, я буду давать тебе сигнал когда и что покупать/продавать !`);
  await bot.sendMessage(chatId, `Сообщение будет выглядеть вот так =>`);
  await bot.sendMessage(chatId, `Разница(AdvCash > Binance): ......... \nЦена на AdvCahs: ........ \nЦена на Binance: ........ \nВремя: ........`);
  await bot.sendMessage(chatId, `Используй /start чтобы перезапустить и /help чтобы попросить помощь`);
  start(chatId);
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `Я на начальной стадии развития поэтому обратись к моему создателю, он 100% тебе поможет. \n@MaxVonRosenhof`);
});

function start(chatId) {
	client.onmessage = async function(event) {
		const binanceValue = JSON.parse(event.data);
		const advcashValue = await getCurrencyValueAdvcash("USDT_TRC20", "RUR", "SELL", 1.00);
		const result = advcashValue.rate - binanceValue.data.c;
		console.log(result)
		if(result >= 0.15) {
			const obj = {
				advcashPrice: advcashValue.rate,
				binancePrice: binanceValue.data.c,
				date: binanceValue.data.E,
				result: result
			};

			bot.sendMessage(chatId, `Разница(AdvCash > Binance): ${obj.result} \nЦена на AdvCahs: ${obj.advcashPrice} \nЦена на Binance: ${obj.binancePrice} \nВремя: ${obj.date}`);
		}
	};
}


client.onerror = function() {
    console.log('There was an ERROR!')
};
client.onopen = function() {
    console.log('The connection was opened')
};
client.onclose = function() {
    console.log('The connection was closed')
};

async function getCurrencyValueAdvcash(fromValue, toValue, type, amountValue) {
	const request = await advcash({
		password: "KJDSV9809870S*DV&)*osdv",
		apiName: "TEST",
		accountEmail: "maxfininvest39@gmail.com"
	});
	const response = await request.checkCurrencyExchange({
			from: fromValue,
			to: toValue,
			action: type,
			amount: amountValue
		});
	const result = await response;
	return result;
}