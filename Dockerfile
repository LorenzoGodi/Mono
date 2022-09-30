FROM node:18.9.1

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

COPY prisma ./prisma/
COPY . .

RUN npm install
RUN npx prisma generate

RUN npx tsc

CMD [ "node", "./dist/script.js" ]