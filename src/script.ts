import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import { Telegraf, Context } from 'telegraf'

import { trans } from '@prisma/client'

const prisma = new PrismaClient()

dotenv.config()

let bot = new Telegraf(process.env.BOT_TOKEN!)

let waitingFor = "transaction_type"
let currentDoing = "nothing"

var obj: {[k: string]: any} = {};

let deleteMe : number[] = [];

const numbers_keyboard = [
  [ { text: "1️⃣", callback_data: "action_trans_1" },{ text: "2️⃣", callback_data: "action_trans_2" },{ text: "3️⃣", callback_data: "action_trans_3" } ],
  [ { text: "4️⃣", callback_data: "action_trans_4" },{ text: "5️⃣", callback_data: "action_trans_5" },{ text: "6️⃣", callback_data: "action_trans_6" } ],
  [ { text: "7️⃣", callback_data: "action_trans_7" },{ text: "8️⃣", callback_data: "action_trans_8" },{ text: "9️⃣", callback_data: "action_trans_9" } ],
  [ { text: "🆗", callback_data: "action_trans_ok" },{ text: "0️⃣", callback_data: "action_trans_0" },{ text: "⬅️", callback_data: "action_trans_back" } ],
]


async function main() {
  bot.command('viewbalance', viewBalance);

  bot.command('viewlasts', viewLasts);

  bot.command('addtransaction', addTransaction);

  bot.action('action_new_trans', action_new_trans);
  bot.action('action_new_outflow', action_new_outflow);
  bot.action('action_new_income', action_new_income);
  
  bot.action('action_trans_1', action_trans_1);
  bot.action('action_trans_2', action_trans_2);
  bot.action('action_trans_3', action_trans_3);
  bot.action('action_trans_4', action_trans_4);
  bot.action('action_trans_5', action_trans_5);
  bot.action('action_trans_6', action_trans_6);
  bot.action('action_trans_7', action_trans_7);
  bot.action('action_trans_8', action_trans_8);
  bot.action('action_trans_9', action_trans_9);
  bot.action('action_trans_0', action_trans_0);
  bot.action('action_trans_ok', action_trans_ok);
  bot.action('action_trans_back', action_trans_back);

  bot.action('action_button0', action_button0);
  bot.action('action_button1', action_button1);
  bot.action('action_button2', action_button2);
  bot.action('action_button3', action_button3);
  bot.action('action_button4', action_button4);
  bot.action('action_button5', action_button5);
  bot.action('action_button6', action_button6);
  bot.action('action_button7', action_button7);
  bot.action('action_button8', action_button8);
  bot.action('action_button9', action_button9);

  bot.on("text", async (ctx) => {
    if (String(ctx.chat?.id) == process.env.CHAT_ID) {    
      let text = ctx.update.message.text
      text = text.toLowerCase()
      let reply = "ERROR";
      
      switch(waitingFor) {
        case "instructions": {
          waitingFor = "transaction_type"
          ctx.reply("Trans / Outflow / Income ?", {
            reply_markup: {
                inline_keyboard: [
                    [ { text: "Transaction", callback_data: "btn-1" } ],
                    [ { text: "Outflow", callback_data: "next" } ],
                    [ { text: "Income", url: "telegraf.js.org" } ]
                ]
            }
          });
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
        let date = d.getFullYear() + '-' + d.getMonth().toString().padStart(2,'0') + '-' + d.getDay().toString().padStart(2,'0') + '-' + d.getHours().toString().padStart(2,'0') + '-' + d.getMinutes().toString().padStart(2,'0') + '-' + d.getSeconds().toString().padStart(2,'0')
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
        let amount = parseFloat(parseFloat(text.replace(",", ".")).toFixed(2))
        if (amount > 0) {
          waitingFor = "income_to"
          obj.amount = amount
          reply = 'To bank?'
        } else {
          reply = "Amount?"
        }
        break;
      }
      
      case "income_to": {
        let bank_names = (await prisma.bank.findMany()).map(x => x.bank_name)
        bank_names = bank_names.filter(x => x.toLowerCase().includes(text.toLowerCase()))
        if (bank_names.length == 1) {
          waitingFor = 'income_tag'
          obj.bank_to = bank_names[0]
          reply = 'Tag?'
        } else {
          reply = 'To bank?'
        }
        break;
      }
      
      case "income_tag": {
        waitingFor = 'income_info'
        obj.tag = text
        reply = 'Info?'
        break;
      }
      
      case "income_info": {
        obj.info = text

        let d = new Date()
        let date = d.getFullYear() + '-' + d.getMonth().toString().padStart(2,'0') + '-' + d.getDay().toString().padStart(2,'0') + '-' + d.getHours().toString().padStart(2,'0') + '-' + d.getMinutes().toString().padStart(2,'0') + '-' + d.getSeconds().toString().padStart(2,'0')
        console.log(date)

        const outflow = await prisma.income.create({
          data: {
            income_datetime: date,
            income_to: obj.bank_to,
            income_amount: obj.amount,
            income_tag: obj.tag,
            income_info: obj.info
          }
        })

        waitingFor = 'instructions'
        reply = 'Done.'
        break;
      }
      
      //
      
      case "transaction_amount": {
        let amount = parseFloat(parseFloat(text.replace(",", ".")).toFixed(2))
        if (amount > 0) {
          waitingFor = "transaction_from"
          obj.amount = amount
          reply = 'From bank?'
        } else {
          reply = "Amount?"
        }
        break;
      }
      
      case "transaction_from": {
        let bank_names = (await prisma.bank.findMany()).map(x => x.bank_name)
        bank_names = bank_names.filter(x => x.toLowerCase().includes(text.toLowerCase()))
        if (bank_names.length == 1) {
          waitingFor = 'transaction_to'
          obj.bank_from = bank_names[0]
          reply = 'To bank?'
        } else {
          reply = 'From bank?'
        }
        break;
      }
      
      case "transaction_to": {
        let bank_names = (await prisma.bank.findMany()).map(x => x.bank_name)
        bank_names = bank_names.filter(x => x.toLowerCase().includes(text.toLowerCase()))
        if (bank_names.length == 1) {
          waitingFor = 'transaction_tag'
          obj.bank_to = bank_names[0]
          reply = 'Tag?'
        } else {
          reply = 'To bank?'
        }
        break;
      }
      
      case "transaction_tag": {
        waitingFor = 'transaction_info'
        obj.tag = text
        reply = 'Info?'
        break;
      }
      
      case "transaction_info": {
        obj.info = text

        let d = new Date()
        let date = d.getFullYear() + '-' + d.getMonth().toString().padStart(2,'0') + '-' + d.getDay().toString().padStart(2,'0') + '-' + d.getHours().toString().padStart(2,'0') + '-' + d.getMinutes().toString().padStart(2,'0') + '-' + d.getSeconds().toString().padStart(2,'0')
        console.log(date)

        const trans = await prisma.trans.create({
          data: {
            trans_datetime: date,
            trans_from: obj.bank_from,
            trans_to: obj.bank_to,
            trans_amount: obj.amount,
            trans_tag: obj.tag,
            trans_info: obj.info
          }
        })

        waitingFor = 'instructions'
        reply = 'Done.'
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
      
      ctx.replyWithMarkdown(str)
      ctx.deleteMessage(ms_id)
  }
  else {
    ctx.reply('Access denied')
  }
}

async function addTransaction(ctx:Context){
  waitingFor = "transaction_type"
  let ms_id = (await ctx.reply("Which type of transaction?", {
    reply_markup: {
        inline_keyboard: [
          [ { text: "❇️ Income", callback_data: "action_new_income" },{ text: "💸 Outflow", callback_data: "action_new_outflow" } ],
          [ { text: "🔁 Transaction", callback_data: "action_new_trans" } ]
    ]}
  })).message_id
  deleteMe.push(ms_id)
}

async function viewLasts(ctx:Context) {
  ctx.reply("Lasts")
}


async function action_new_trans(ctx:Context) {
  while(deleteMe.length > 0) {
    let d = deleteMe.pop()
    ctx.deleteMessage(d)
  }

  waitingFor = 'amount'
  currentDoing = 'trans'

  let ms_id = (await ctx.replyWithMarkdown("Creating new Transaction 🔁\nWhat's the amount?\n`0.00 €`", {
    reply_markup: {
        inline_keyboard: numbers_keyboard }
  })).message_id

  deleteMe.push(ms_id)

  obj.amount_str = ""
  obj.amount = 0
}

async function action_new_outflow(ctx:Context) {
  while(deleteMe.length > 0) {
    let d = deleteMe.pop()
    ctx.deleteMessage(d)
  }

  waitingFor = 'amount'
  currentDoing = 'outflow'

  let ms_id = (await ctx.replyWithMarkdown("Creating new Outflow 💸\nWhat's the amount?\n`0.00 €`", {
    reply_markup: {
        inline_keyboard: numbers_keyboard }
  })).message_id

  deleteMe.push(ms_id)

  obj.amount_str = ""
  obj.amount = 0
}
async function action_new_income(ctx:Context) {
  while(deleteMe.length > 0) {
    let d = deleteMe.pop()
    ctx.deleteMessage(d)
  }

  waitingFor = 'amount'
  currentDoing = 'income'

  let ms_id = (await ctx.replyWithMarkdown("Creating new Income ❇️\nWhat's the amount?\n`0.00 €`", {
    reply_markup: {
        inline_keyboard: numbers_keyboard }
  })).message_id

  deleteMe.push(ms_id)

  obj.amount_str = ""
  obj.amount = 0
}







async function action_trans_1(ctx:Context) {
  obj.amount_str = obj.amount_str + "1"
  compose_number(obj.amount_str, ctx)
}
async function action_trans_2(ctx:Context) {
  obj.amount_str = obj.amount_str + "2"
  compose_number(obj.amount_str, ctx)
}
async function action_trans_3(ctx:Context) {
  obj.amount_str = obj.amount_str + "3"
  compose_number(obj.amount_str, ctx)
}
async function action_trans_4(ctx:Context) {
  obj.amount_str = obj.amount_str + "4"
  compose_number(obj.amount_str, ctx)
}
async function action_trans_5(ctx:Context) {
  obj.amount_str = obj.amount_str + "5"
  compose_number(obj.amount_str, ctx)
}
async function action_trans_6(ctx:Context) {
  obj.amount_str = obj.amount_str + "6"
  compose_number(obj.amount_str, ctx)
}
async function action_trans_7(ctx:Context) {
  obj.amount_str = obj.amount_str + "7"
  compose_number(obj.amount_str, ctx)
}
async function action_trans_8(ctx:Context) {
  obj.amount_str = obj.amount_str + "8"
  compose_number(obj.amount_str, ctx)
}
async function action_trans_9(ctx:Context) {
  obj.amount_str = obj.amount_str + "9"
  compose_number(obj.amount_str, ctx)
}
async function action_trans_0(ctx:Context) {
  obj.amount_str = obj.amount_str + "0"
  compose_number(obj.amount_str, ctx)
}

function compose_number(n:string, ctx:Context) {
  if (n.length < 4) {
    n = "0000" + n
  }

  let numb:string = n.toString()
  let sx = numb.substring(0, numb.length - 2)
  sx = String(parseInt(sx))
  numb = sx + "." + numb.substring(numb.length - 2)
  // console.log(numb)
  ctx.editMessageText("Creating new Transaction\\.\nWhat's the amount?\n`" + numb + " €`", {
    reply_markup: {
      inline_keyboard: numbers_keyboard },
      parse_mode: "MarkdownV2"
    })
}
    
async function action_trans_back(ctx:Context) {
  if(obj.amount_str.length > 0) {
    obj.amount_str = obj.amount_str.toString().substring(0, obj.amount_str.length - 1)
    compose_number(obj.amount_str, ctx)
  }
}

async function action_trans_ok(ctx:Context) {
  obj.amount = parseFloat(obj.amount_str)

  if (obj.amount > 0) {

    let str_begin = ""
    switch (currentDoing) {
      case "trans":
        waitingFor = 'from'
        str_begin = "From"
        break;
      case "outflow":
        waitingFor = 'from'
        str_begin = "From"
        break;    
      case "income":
        waitingFor = 'to'
        str_begin = "To"
        break;
    }

    let bank_names = (await prisma.bank.findMany()).map(x => x.bank_name)
    let buttons = bank_names.map((x,y) => "[{ \"text\": \"" + x + "\", \"callback_data\": \"action_button" + y.toString() + "\" }]")
    // console.log(buttons.reduce((x,y) => x + "," + y))
    let ms_id = (await ctx.reply(str_begin + " which bank?", {
      reply_markup: {
          inline_keyboard: JSON.parse("[" + buttons.reduce((x,y) => x + "," + y) + "]") 
        }
      })).message_id
    
    while(deleteMe.length > 0) {
      let d = deleteMe.pop()
      ctx.deleteMessage(d)
    }
    deleteMe.push(ms_id)
  }
}






async function action_button0(ctx:Context) {
  generic_button_press(ctx, 0)
}
async function action_button1(ctx:Context) {
  generic_button_press(ctx, 1)
}
async function action_button2(ctx:Context) {  
  generic_button_press(ctx, 2)
}
async function action_button3(ctx:Context) {
  generic_button_press(ctx, 3)  
}
async function action_button4(ctx:Context) {
  generic_button_press(ctx, 4)  
}
async function action_button5(ctx:Context) {
  generic_button_press(ctx, 5)  
}
async function action_button6(ctx:Context) {
  generic_button_press(ctx, 6)  
}
async function action_button7(ctx:Context) {
  generic_button_press(ctx, 7)  
}
async function action_button8(ctx:Context) {
  generic_button_press(ctx, 8)  
}
async function action_button9(ctx:Context) {
  generic_button_press(ctx, 9)
}

async function generic_button_press(ctx:Context, n:number) {
  let bank_names = (await prisma.bank.findMany()).map(x => x.bank_name)

  switch (waitingFor) {
    case "from":
      obj.from = bank_names[n]
      bank_names = bank_names.filter(x => x != obj.from)

      switch (currentDoing) {
        case "trans":
          let buttons = bank_names.map((x,y) => "[{ \"text\": \"" + x + "\", \"callback_data\": \"action_button" + y.toString() + "\" }]")
          // console.log(buttons.reduce((x,y) => x + "," + y))
          let ms_id = (await ctx.reply("To which bank?", {
            reply_markup: {
              inline_keyboard: JSON.parse("[" + buttons.reduce((x,y) => x + "," + y) + "]") 
            }
          })).message_id
          waitingFor = 'to'
    
          while(deleteMe.length > 0) {
            let d = deleteMe.pop()
            ctx.deleteMessage(d)
          }
          deleteMe.push(ms_id)
          break;

        case "outflow":
          waitingFor = 'tag'

          break;
      }

      break;

    case "to":
      obj.to = bank_names[n]
      waitingFor = 'tag'

      switch (currentDoing) {
        case "trans":
          // const result = await prisma.$queryRaw<trans[]>`SELECT trans_tag FROM trans GROUP BY trans_tag ORDER BY COUNT(trans_tag) DESC LIMIT 5`
          const result = await prisma.$queryRaw<trans[]>`SELECT trans_tag FROM trans GROUP BY trans_tag ORDER BY COUNT(trans_tag) DESC LIMIT 5`
          let tags = result.map(x => x.trans_tag)

          let ms_id
          if(tags.length > 0) {
            let buttons = tags.map((x,y) => "[{ \"text\": \"" + x + "\", \"callback_data\": \"action_button" + y.toString() + "\" }]")
  
            ms_id = (await ctx.reply("Choose or write a tag", {
              reply_markup: {
                inline_keyboard: JSON.parse("[" + buttons.reduce((x,y) => x + "," + y) + "]") 
              }
            })).message_id
          } else {
            ms_id = (await ctx.reply("Write a tag")).message_id
          }
    
          while(deleteMe.length > 0) {
            let d = deleteMe.pop()
            ctx.deleteMessage(d)
          }
          deleteMe.push(ms_id)

          break;

        case "income":
          break;
      }

      break;
    
    case "tag":
      break;
  }
}