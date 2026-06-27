FROM node:18-bullseye

# Ciro tare da saka Injin FFmpeg da Python
RUN apt-get update && apt-get install -y ffmpeg python3python-is-phyton3

# Tsarin aikin Node.js
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Umarnin kunna sabar
CMD ["npm", "start"
