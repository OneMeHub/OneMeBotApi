# OneMe Bot API

## Документация

В [документации](https://github.com/OneMeHub/OneMeBotApi/tree/master/docs) вы можете найти подробные инструкции по использованию фреймворка.

## Быстрый старт

> Если вы новичок, то можете прочитать [официальную документацию](https://dev.tamtam.chat/), написанную разработчиками OneMe

### Получение токена
Откройте диалог с [PrimeBot](https://tamtam.chat/primebot), следуйте инструкциям и создайте нового бота. После создания бота PrimeBot отправит вам токен.

### Установка
#### npm
```sh
npm install @onemehub/one-me-bot-api
```
#### yarn
```sh
yarn add @onemehub/one-me-bot-api
```
#### pnpm
```sh
pnpm add @onemehub/one-me-bot-api
```

### Пример
```javascript
import { Bot } from '@onemehub/one-me-bot-api';

const bot = new Bot(process.env.BOT_TOKEN);

// Установка подсказок с доступными командами
bot.api.setMyCommands([
  { 
    name: 'ping',
    description: 'Сыграть в пинг-понг'
  },
]);

// Обработчик события запуска бота
bot.on('bot_started', (ctx) => ctx.reply('Привет! Отправь мне команду /ping, чтобы сыграть в пинг-понг'));

// Обработчик команды '/ping'
bot.command('ping', (ctx) => ctx.reply('pong'));

// Обработчик для сообщения с текстом 'hello'
bot.hears('hello', (ctx) => ctx.reply('world'));

// Обработчик для всех остальных входящих сообщений
bot.on('message_created', (ctx) => ctx.reply(ctx.message.body.text));

bot.start();
```

### Обработка ошибок
Если во время обработки события произойдёт ошибка, Bot вызовет метод `bot.handleError`. По умолчанию `bot.handleError` просто завершает работу программы, но вы можете переопределить это поведение, используя `bot.catch`.

> ⚠️ Завершайте работу программы при неизвестных ошибках, иначе бот может зависнуть в состоянии ошибки.

> ℹ️ [`pm2`](https://pm2.keymetrics.io/) может автоматически перезапустить вашего бота, если он остановится по какой-либо причине
