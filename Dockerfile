FROM node:20-alpine3.18 AS base
ENV HOME=/app
WORKDIR /app

# Install all packages
COPY package.json package-lock.json /app/
RUN npm install --include dev

# Build static & reinstall production packages
COPY gulpfile.js /app
COPY client /app/client
RUN set -x \
    && mkdir -p public/css public/js \
    && npx gulp \
    && rm -r node_modules \
    && npm install --omit dev \
    && rm -r /app/.npm

FROM node:20-alpine3.18

ARG GIT_BRANCH=local
ARG GIT_COMMIT=local
ARG VERSION=local
ARG PIPELINE_ID=local
ARG SOURCE=local

ENV GIT_BRANCH=$GIT_BRANCH \
    GIT_COMMIT=$GIT_COMMIT \
    VERSION=$VERSION \
    PIPELINE_ID=$PIPELINE_ID \
    SOURCE=$SOURCE

ENV HOME=/app
COPY --from=base --chown=nobody:nobody /app /app
COPY . /app
WORKDIR /app
USER nobody:nobody
CMD ["npx", "pm2", "start", "--no-daemon"]
