FROM node:24-alpine
RUN corepack enable && corepack install --global yarn@1.22.22
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY yarn.lock ./
COPY . ./
RUN yarn install
RUN yarn build
CMD ["yarn", "start"]
