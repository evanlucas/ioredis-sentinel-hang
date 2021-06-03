FROM node:14 as base

WORKDIR /opt/app

COPY ./package.json package-lock.json /opt/app/

RUN npm ci

COPY . /opt/app

FROM node:14 as test

COPY --from=base --chown=1000:1000 /opt/app /opt/app

# VOLUME /opt/app
WORKDIR /opt/app
USER 1000
