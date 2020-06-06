FROM nodered/node-red

COPY app/package.json .
RUN npm i