# Stage 1: Build the app
FROM node:20-alpine as builder
WORKDIR /app
COPY . .
RUN yarn install
RUN yarn run build

# Stage 2: Run the app
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY .env .env
EXPOSE 3000
CMD ["node", "dist/main"]
