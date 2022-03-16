# Stage 1: Build code
FROM node as builder
WORKDIR /usr/app/
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Start app
FROM node:lts-alpine as starter
WORKDIR /usr/app
COPY --from=builder /usr/app/ ./

# set the NODE_ENV to be used in the API
ENV NODE_ENV=production

EXPOSE 4004 4005 4006 4007 4008 4009 4010 50054 50055 50056 50057 50058 50059 50060
CMD ["node", "dist/src/main.js"]
