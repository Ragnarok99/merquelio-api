FROM node:16-alpine as base

ENV ROOT_DIR=/app

WORKDIR $ROOT_DIR

COPY ./package.json ./yarn.lock $ROOT_DIR/


FROM base as debug
ENV NODE_ENV=debug
RUN yarn install
COPY . $ROOT_DIR
EXPOSE 3000
CMD ["yarn", "start:debug"]

FROM base as development
RUN yarn install
COPY . $ROOT_DIR
# Installs latest Chromium package.
RUN apk upgrade --no-cache --available \
    && apk add --no-cache \
      chromium \
      ttf-freefont \
      font-noto-emoji \
    && apk add --no-cache \
      --repository=https://dl-cdn.alpinelinux.org/alpine/edge/testing \
      font-wqy-zenhei

COPY local.conf /etc/fonts/local.conf

# Add Chrome as a user
RUN mkdir -p /usr/src/app \
    && adduser -D chrome \
    && chown -R chrome:chrome /usr/src/app
# Run Chrome as non-privileged
# USER chrome

# Playwright
ENV CHROME_BIN=/usr/bin/chromium-browser \
    CHROME_PATH=/usr/lib/chromium/ \
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

RUN chmod +x ./docker-entrypoint.sh
ENTRYPOINT ["sh", "./docker-entrypoint.sh"]
EXPOSE 3000

FROM base as test
RUN yarn ci
COPY . $ROOT_DIR
RUN yarn test

FROM base as build
RUN yarn ci
COPY . $ROOT_DIR
RUN chmod +x ./docker-entrypoint.sh
ENTRYPOINT ["sh", "./docker-entrypoint.sh"]

FROM base as lint
RUN yarn ci
COPY . $ROOT_DIR
RUN yarn lint

FROM base as prod
RUN yarn install
COPY . $ROOT_DIR
RUN chmod +x ./docker-entrypoint.sh
ENTRYPOINT ["sh", "./docker-entrypoint.sh"]
EXPOSE 3000
