FROM node:18-alpine

WORKDIR /app
EXPOSE 48001

COPY ./app/ ./
RUN npm install
CMD ["npm", "start"]