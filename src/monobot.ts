import { PrismaClient } from '@prisma/client'
import { Telegraf, Context } from "telegraf";

export class MonoBot {
    private bot: Telegraf;
    prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();

        const TOKEN = process.env.BOT_TOKEN!

        this.bot = new Telegraf(TOKEN)

        this.bot.start(this.startFn);

        this.bot.command('newTransaction', this.newTransaction);
        this.bot.command('viewBalance', this.viewBalance);

        this.bot.launch();
    }

    private startFn(ctx:Context){
        console.log(ctx.chat)        
        if (ctx.chat?.id == process.env.CHAT_ID) {
            ctx.reply('Auth ok')
        }
        else {
            ctx.reply('Access denied')
        }
    }

    private newTransaction(ctx:Context){
        console.log(ctx.chat)        
        if (ctx.chat?.id == process.env.CHAT_ID) {
            ctx.reply('Auth ok')
        }
        else {
            ctx.reply('Access denied')
        }
    }

    private async viewBalance(ctx:Context){
        console.log(ctx.chat)        
        if (ctx.chat?.id == process.env.CHAT_ID) {
            ctx.reply('Going to')
            const banks = await this.prisma.bank.findMany()
            ctx.reply('Done')
        }
        else {
            ctx.reply('Access denied')
        }
    }

    private auth(ctx:Context) {}
}