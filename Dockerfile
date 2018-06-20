FROM node:10.4.1

COPY . /app
WORKDIR /app
RUN npm install -g nodemon
RUN npm install
EXPOSE 80
CMD ["npm","start"]
