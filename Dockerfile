FROM node:18.16.0

WORKDIR /usr/src/app

# Install app dependencies
COPY . /usr/src/app

RUN yarn install

RUN yarn build

EXPOSE 3000
CMD [ "yarn", "start" ]