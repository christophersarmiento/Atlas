FROM node:alpine

COPY . .

RUN npm i

# TODO: run bot