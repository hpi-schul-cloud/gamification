FROM node:10.4.1

COPY . /app
WORKDIR /app
ENV NODE_ENV=production
RUN npm install --only=production
EXPOSE 3030
CMD ["npm","start"]
