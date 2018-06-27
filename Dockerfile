FROM node:10.4.1

COPY . /app
WORKDIR /app
RUN npm install
EXPOSE 3030
CMD ["npm","start"]
