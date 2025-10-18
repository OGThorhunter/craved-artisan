FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY server/package.json server/
RUN npm ci --omit=dev --workspace=server

FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run -w server build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/server/node_modules ./server/node_modules

# Copy built application
COPY --from=build /app/server/dist ./server/dist

# Copy Prisma schema (required for generation)
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/server/package.json ./server/package.json

# Generate Prisma Client in production environment
RUN npx prisma generate

CMD ["node", "server/dist/index.js"]
