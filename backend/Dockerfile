FROM node:22-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

# ลบ client เก่าที่เป็นของ Mac ออกก่อน
RUN rm -rf node_modules/.prisma node_modules/@prisma/client

# generate client ใหม่ใน Docker
RUN npx prisma generate

EXPOSE 3000
CMD ["npm", "run", "start:dev"]