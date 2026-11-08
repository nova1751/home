# 构建静态站点
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# 使用 nginx 托管静态文件
FROM nginx:alpine
COPY --from=builder /app/.output/public /usr/share/nginx/html
RUN sed -i 's/listen\s*80;/listen 12445;/; s/listen\s*\[::\]:80;/listen [::]:12445;/' /etc/nginx/conf.d/default.conf \
  && sed -i 's/#gzip  on;/gzip on;\n    gzip_types text\/css application\/javascript application\/json image\/svg+xml application\/manifest+json;/' /etc/nginx/nginx.conf
EXPOSE 12445
