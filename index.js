require('dotenv').config();
const { Telegraf } = require('telegraf');
const Calendar = require('telegraf-calendar-telegram');
const bot = new Telegraf(process.env.TOKEN, {polling: true});

const calendar = new Calendar(bot, {
    startWeekDay: 0,
    weekDayNames: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    monthNames: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ],
    minDate: null,
    maxDate: null
});

// listen for the selected date event
list = []
calendar.setDateListener((context, date) => {
	list.add(date);
	context.reply(list);
});

bot.catch((err) => {
	console.log("Error in bot:", err);
});
// retreive the calendar HTML
bot.command("calendar", context => {

	// Find today
	const today = new Date();
	const minDate = new Date();
	minDate.setMonth(today.getMonth() - 3);
	const maxDate = new Date();
	maxDate.setMonth(today.getMonth() + 3);
	maxDate.setDate(today.getDate());

	context.reply("Here you are", calendar.setMinDate(minDate).setMaxDate(maxDate).getCalendar())
});

bot.launch();