import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import { Telegraf, Context } from 'telegraf'

const prisma = new PrismaClient()

dotenv.config()

let bot = new Telegraf(process.env.BOT_TOKEN!)

let waitingFor = "transaction_type"
var obj: {[k: string]: any} = {};

async function main() {
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
        types = types.filter(x => x.includes(text.toLowerCase()))
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
        let bank_names = (await prisma.bank.findMany()).map(x => x.bank_name)
        bank_names = bank_names.filter(x => x.toLowerCase().includes(text.toLowerCase()))
        if (bank_names.length == 1) {
          waitingFor = 'outflow_tag'
          obj.bank_from = bank_names[0]
          reply = 'Tag?'
        } else {
          reply = 'From bank?'
        }
        break;
      }
      
      case "outflow_tag": {
        waitingFor = 'outflow_info'
        obj.tag = text
        reply = 'Info?'
        break;
      }
      
      case "outflow_info": {
        obj.info = text

        let d = new Date()
        let date = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDay() + '-' + d.getHours() + '-' + d.getMinutes() + '-' + d.getSeconds()
        console.log(date)

        const outflow = await prisma.outflow.create({
          data: {
            outflow_datetime: date,
            outflow_from: obj.bank_from,
            outflow_amount: obj.amount,
            outflow_tag: obj.tag,
            outflow_info: obj.info
          }
        })

        waitingFor = 'instructions'
        reply = 'Done.'
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
  if (String(ctx.chat?.id) == process.env.CHAT_ID) {
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
