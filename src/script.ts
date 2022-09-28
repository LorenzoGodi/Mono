import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import { Telegraf, Context } from 'telegraf'
import { MonoBot } from './monobot'

const prisma = new PrismaClient()

dotenv.config()

let bot = new Telegraf(process.env.BOT_TOKEN!)

let waitingFor = "transaction_type"
var obj: {[k: string]: any} = {};

async function main() {
  const banks = await prisma.bank.findMany()
  console.log(banks)    
  const transs = await prisma.trans.findMany()
  console.log(transs)

  bot.command('viewBalance', viewBalance);

  bot.command('addTransaction', addTransaction);

  bot.on("text", async (ctx) => {
    if (String(ctx.chat?.id) == process.env.CHAT_ID) {    
      let text = ctx.update.message.text
      text = text.toLowerCase()
      let reply = "ERROR";
      
      switch(waitingFor) {
        case "instructions": {
          reply = "Trans / Outflow / Income ?"
          waitingFor = "transaction_type"
          break;
      }

      case "transaction_type": {
        let types = ['transaction', 'outflow', 'income']
        types = types.filter(x => x.includes(text))
        if (types.length == 1) {
          waitingFor = types[0] + "_amount"
          reply = "Amount?"
        } else {
          reply = "Trans / Outflow / Income ?"
        }
        break;
      }

      //

      case "outflow_amount": {
        let amount = parseFloat(parseFloat(text.replace(",", ".")).toFixed(2))
        if (amount > 0) {
          waitingFor = "outflow_from"
          obj.amount = amount
          reply = 'From bank?'
        } else {
          reply = "Amount?"
        }
        break;
      }

      case "outflow_from": {
        const bank_names = await prisma.bank.findMany()
        // (JSON.parse(String(bank_names))).map(x => x.bank_name)

        // reply = String(bank_names)
        // console.log(bank_names)
        

        
        
        break;
      }
      
      //
      
      case "income_amount": {
        
        break;
      }
      
      //
      
      case "transaction_amount": {
        
        break;
      }
    }
    
    await ctx.reply(reply)
    } else {
      ctx.reply('Access denied')
    }
  });
  
  bot.launch();
  }

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

async function viewBalance(ctx:Context) {       
  if (ctx.chat?.id == process.env.CHAT_ID) {
      const ms_id = (await ctx.reply('Working on it...')).message_id
      const banks = await prisma.bank.findMany({
        orderBy: [
          {
            bank_name: 'asc'
          }
        ]
      })

      let str = ""
      for (let b of banks) {
        if (b.bank_ismain) {
          str += "`" + b.bank_name.padEnd(12, ' ') + (String(b.bank_money)).padStart(8, ' ') + " €`\n" 
        }
      }
      str += "`" + "".padStart(22, '-') + "`\n"
      for (let b of banks) {
        if (!b.bank_ismain) {
          str += "`" + b.bank_name.padEnd(12, ' ') + (String(b.bank_money)).padStart(8, ' ') + " €`\n" 
        }
      }
      
      // ctx.reply(JSON.stringify(banks))
      ctx.deleteMessage(ms_id)
      ctx.replyWithMarkdown(str)
  }
  else {
    ctx.reply('Access denied')
  }
}

async function addTransaction(ctx:Context){
  waitingFor = "transaction_type"
  ctx.reply("Trans / Outflow / Income ?")
}
