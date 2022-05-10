FROM node:18-alpine

WORKDIR /app
EXPOSE 48001

COPY ./app/ ./
# RUN npm install --production
RUN npm ci
CMD ["npm", "start"]