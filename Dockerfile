# Based on: https://blog.3d-logic.com/2023/02/05/running-puppeteer-in-a-docker-container-on-raspberry-pi/
FROM node:20-buster
RUN apt-get update
RUN apt-get install chromium -y
RUN mkdir -p /app
WORKDIR /app
COPY . .
RUN npm install -g pnpm
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN pnpm install
CMD [ "pnpm", "dlx", "turbo", "worker:run" ]