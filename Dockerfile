FROM node:16

WORKDIR /eden

COPY package*.json ./
RUN npm install pm2 -g 
RUN npm install 

COPY ./ ./
RUN npm run build


EXPOSE 80

CMD ["pm2-runtime", "start", "./dist/index.js"]