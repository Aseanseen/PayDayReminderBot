require('dotenv').config();
const { Telegraf } = require('telegraf');
const session = require('telegraf-session-local');
const Calendar = require('telegraf-calendar-telegram');
const Stage = require('telegraf');
const WizardScene = require('telegraf');
const Markup = require('telegraf');
const bot = new Telegraf(process.env.TOKEN, {polling: true});

// import { Context, Telegraf } from 'telegraf'
// import session from 'telegraf/session'

// interface SessionData {
//   entries?: titles
//   // ... more session data go here
// }

// // Define your own context type
// interface MyContext extends Context {
//   session?: SessionData
//   // ... more props go here
// }

// const Calendar = require('telegraf-calendar-telegram');
// const bot = new Telegraf<MyContext>(process.env.TOKEN, {polling: true});

// const storage = {
  // getItem(key) { /* load a session for `key` ... */ },
  // setItem(key, value) { /* save a session for `key` ... */ },
  // deleteItem(key) { /* delete a session for `key` ... */ }
// }
// Make session data available
// bot.use(session({storage}))

// Make session data available
// bot.use(session())
// // Register middleware and launch your bot as usual
// bot.use((ctx, next) => {
//   // Yay, `session` is now available here as `SessionData`!
//   if (ctx.message !== undefined)
//     ctx.session.entries = ["Math Tuition"]
//   return next()
// })

// bot.on('photo', (ctx, next) => {
//   ctx.session.photoCount = 1 + (ctx.session.photoCount ?? 0)
//   return next()
// })

// start the bot
// bot.start(ctx => {
	// ctx.reply(
	// 	`Hello ${ctx.from.first_name}, want automated messages?`,
	// 	Markup.inlineKeyboard([
	// 		Markup.callbackButton("Yes", "new_title")
	// 	]).extra()
	// );
// });

// set up calendar
const calendar = new Calendar(bot, {
    startWeekDay: 1,
    weekDayNames: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    monthNames: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ],
    minDate: null,
    maxDate: null
});

// start date selection from calendar
dates = []
var message = "The selected dates are:\r\n";
calendar.setDateListener((context, date) => {
	dates.push(date);
	message += date + "\r\n";
	context.reply(message);
});

// new WizardScene
const newTitle = new WizardScene(
	"new_title",
	ctx => {
		ctx.reply("Please enter the title.");
		return ctx.wizard.next();
	},
	ctx => {
		ctx.wizard.state.yourTitle = ctx.message.text; // store yourTitle in the state to share data between middlewares
		ctx.reply("Enter the greeting of your message.");
		return ctx.wizard.next();
	},
	ctx => {
		const yourGreeting = ctx.message.text;
		const yourTitle = ctx.wizard.state.yourTitle;
		
		// Set up the calendar
		const today = new Date();
		const minDate = new Date();
		minDate.setMonth(today.getMonth() - 3);
		const maxDate = new Date();
		maxDate.setMonth(today.getMonth() + 3);
		maxDate.setDate(today.getDate());
		ctx.reply("Please select the dates", calendar.setMinDate(minDate).setMaxDate(maxDate).getCalendar())

		return ctx.scene.leave();
	}
);

// // set up the event
// bot.command("new", context => {
// 	context.reply("Please enter the event title");

// 	// Set up the calendar
// 	const today = new Date();
// 	const minDate = new Date();
// 	minDate.setMonth(today.getMonth() - 3);
// 	const maxDate = new Date();
// 	maxDate.setMonth(today.getMonth() + 3);
// 	maxDate.setDate(today.getDate());

// 	context.reply("Please select the dates", calendar.setMinDate(minDate).setMaxDate(maxDate).getCalendar())

// });


// // set up the calendar
// bot.command("calendar", context => {

// 	// Find today
// 	const today = new Date();
// 	const minDate = new Date();
// 	minDate.setMonth(today.getMonth() - 3);
// 	const maxDate = new Date();
// 	maxDate.setMonth(today.getMonth() + 3);
// 	maxDate.setDate(today.getDate());

// 	context.reply("Please select the dates", calendar.setMinDate(minDate).setMaxDate(maxDate).getCalendar())
// });

bot.catch((err) => {
	console.log("Error in bot:", err);
});

const stage = new Stage([newTitle], { default: "new_title" }); // Scene registration
bot.use(session())
bot.use(stage.middleware());
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))