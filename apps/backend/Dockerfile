FROM node:alpine As development

RUN apk add --no-cache python3 py3-pip make g++

WORKDIR /usr/apps/backend

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm

RUN pnpm install --frozen-lockfile --shamefully-hoist

COPY . .

RUN pnpm run build

FROM node:alpine as production

RUN apk add --no-cache python3 py3-pip make g++

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/apps/backend

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm

RUN pnpm install --prod

COPY --from=development /usr/apps/backend/dist ./dist

CMD ["node", "dist/main"]