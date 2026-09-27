FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY backend/tsconfig.json ./backend/tsconfig.json
COPY backend/src ./backend/src
RUN npx esbuild backend/src/server.ts --bundle --platform=node --format=esm --packages=external --sourcemap --outfile=backend/dist/server.js \
    && npx esbuild backend/src/migrate.ts --bundle --platform=node --format=esm --packages=external --outfile=backend/dist/migrate.js \
    && npx esbuild backend/src/seed.ts --bundle --platform=node --format=esm --packages=external --outfile=backend/dist/seed.js \
    && npx esbuild backend/src/check.ts --bundle --platform=node --format=esm --packages=external --outfile=backend/dist/check.js \
    && cp backend/src/schema.sql backend/dist/schema.sql

FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/backend/dist ./backend/dist

USER node
EXPOSE 8000
CMD ["sh", "-c", "node backend/dist/migrate.js && node backend/dist/server.js"]