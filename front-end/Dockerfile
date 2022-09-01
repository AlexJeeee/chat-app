FROM node:14-alpine AS builder
WORKDIR /web-app
COPY . .
RUN npm config set registry https://registry.npmmirror.com
RUN yarn install --frozen-lockfile
RUN yarn build

FROM node:alpine
WORKDIR /web-app
COPY --from=builder /web-app/build /web-app/build
EXPOSE 3000