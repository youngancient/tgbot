const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config(); // Load environment variables from .env file

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const fixedGuess = 20;
// Map to store users who sent "/pickme"
const pickedUsers = new Map();

// Counter for the number of winners selected in the last 24 hours
let winnersCount = 0;

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to pick a winner and announce in the main group
function pickWinner(chatId, userId, type) {
  const users = Array.from(pickedUsers.keys());
  if (users.length > 0 && winnersCount < 5) {
    if (getRandomNumber(1, 1000) === fixedGuess) {
      const winnerUsername = pickedUsers.get(userId);
      winnersCount++;
      // Announce the winner in the main group
      const announcementMessage = `${winnerUsername} has been selected by Santa🎅🏻!`;
      bot.sendMessage(chatId, announcementMessage);
      // Send a DM to the winner
      const dmMessage = `Hey ${winnerUsername}, Santa🎅🏻 picked you! Congrats! 🎉 DM @jude for rewards.`;
      bot.sendMessage(userId, dmMessage);
    } else {
      const sorryMessage = "Yo! Sorry Santa🎅🏻 didnt pick you, try later!";
      type == "chat"
        ? bot.sendMessage(chatId, sorryMessage)
        : bot.sendMessage(userId, sorryMessage);
    }
  } else {
    const quotaExceededMsg =
      "Try again after 24hrs, You're gonna win! Santa🎅🏻 is rooting for you!";
    type == "chat"
      ? bot.sendMessage(chatId, quotaExceededMsg)
      : bot.sendMessage(userId, quotaExceededMsg);
  }
}


// Function to create a customized keyboard
function createCustomKeyboard() {
    // Define the keyboard layout
    const keyboard = [
        ['Pick Me🎅🏻', 'WhitePaper'],
        ['Website', 'Santa Memes😏'],
      ];
  
    return {
      keyboard,
      resize_keyboard: true,
      one_time_keyboard: false,
    };
  }

// Listen for "/start" command in DM or group
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
//   const introductionMessage =
//     "Hi, I am DevGojo. send /pickme to get selected 🎅🏻";
//   bot.sendMessage(chatId, introductionMessage);

  // Create the customized keyboard
  const replyMarkup = createCustomKeyboard();

  // Send a welcome message with the customized keyboard
  bot.sendMessage(chatId, 'Hi, I am DevGojo🎅🏻 Select what you want:', { reply_markup: replyMarkup })
    .catch((error) => console.error('Error sending message with keyboard:', error));
});

// Listen for "/pickme" command in DM or group
bot.onText(/\/pickme/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username;
  // Check if the user has sent "/pickme" in the last 24 hours
  if (pickedUsers.has(userId)) {
    bot.sendMessage(
      chatId,
      `Sorry ${username}, You can only play with Santa🎅🏻 once in 24 hours.`
    );
  } else {
    // Store the user and respond
    pickedUsers.set(userId, username);

    // If it's a group, pick a winner if conditions are met
    if (msg.chat.type === "group" || msg.chat.type === "supergroup") {
      pickWinner(chatId, userId, (type = "chat"));
    } else {
      // If it's a DM, respond directly to the user
      pickWinner(chatId, userId, (type = "dm"));
    }
  }
});


bot.onText(/\/startkeyboard/, (msg) => {
    const chatId = msg.chat.id;
    const replyMarkup = createCustomKeyboard();
  
    // Send a message with the customized keyboard
    bot.sendMessage(chatId, 'Hi, I am DevGojo🎅🏻 Select what you want:', { reply_markup: replyMarkup })
    .catch((error) => console.error('Error sending message with keyboard:', error));
});

// Handle button clicks
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    // Handle button clicks based on the received text
    switch (text) {
      case 'Pick Me🎅🏻':
        bot.sendMessage(chatId, '/pickme');
        break;
      case 'WhitePaper':
        bot.sendMessage(chatId, '/whitepaper');
        break;
      case 'Website':
        bot.sendMessage(chatId, '/website');
        break;
      case 'Santa Memes😏':
        bot.sendMessage(chatId, '/meme');
        break;
    }
})

// Schedule the reset of picked users and winners count every 24 hours
setInterval(() => {
  pickedUsers.clear();
  winnersCount = 0;
}, 24 * 60 * 60 * 1000);

// Handle errors
bot.on("polling_error", (error) => {
  console.error(error);
});


console.log("Bot is running...");
