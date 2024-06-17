# base image
FROM node:12.2.0-alpine
##RUN apk update
##RUN npm install -g nodemon

# set working directory
WORKDIR /app/
COPY ./src /app

RUN chmod +x /app/index.js

# CMD ["npm", "i"]

# add `/app/node_modules/.bin` to $PATH
# ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
RUN npm install

ENTRYPOINT ["node", "index.js"]
