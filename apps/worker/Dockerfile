FROM node:20-alpine
WORKDIR /app
RUN echo "Placeholder worker - no op" > README.txt
CMD ["node", "-e", "setInterval(()=>{}, 1e9)"]
