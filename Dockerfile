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
RUN chmod +x ./docker-entrypoint.sh
# RUN npx playwright install --with-deps
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
# RUN npx playwright install --with-deps
ENTRYPOINT ["sh", "./docker-entrypoint.sh"]

FROM base as lint
RUN yarn ci
COPY . $ROOT_DIR
RUN yarn lint

FROM base as prod
RUN yarn install
COPY . $ROOT_DIR
RUN chmod +x ./docker-entrypoint.sh
# RUN npx playwright install --with-deps
ENTRYPOINT ["sh", "./docker-entrypoint.sh"]
EXPOSE 3000
