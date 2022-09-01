FROM node:latest
WORKDIR /back-end
COPY . .
RUN yarn install
EXPOSE 8080
ENTRYPOINT node /server/index.js