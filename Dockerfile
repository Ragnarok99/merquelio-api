FROM node:16-alpine as base

ENV ROOT_DIR=/app

WORKDIR $ROOT_DIR
USER root
COPY . $ROOT_DIR
# RUN chmod +x ./docker-entrypoint.sh
RUN yarn  
RUN yarn build
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
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=

FROM base as development
ENTRYPOINT ["sh", "./docker-entrypoint.sh"]
CMD ["yarn", "start:dev"]

# FROM base as test
# COPY . $ROOT_DIR

# FROM base as build
# ENTRYPOINT ["./docker-entrypoint.sh"]

# FROM base as lint
# COPY . $ROOT_DIR

# FROM base as prod
# ENTRYPOINT ["./docker-entrypoint.sh"]
