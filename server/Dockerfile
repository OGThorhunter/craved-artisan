FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY server/package.json server/
RUN npm ci --omit=dev --workspace=server

FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci
RUN npx prisma generate
RUN npm run -w server build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/prisma ./prisma
CMD ["node", "server/dist/index.js"]
