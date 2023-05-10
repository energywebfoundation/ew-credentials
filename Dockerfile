FROM --platform=linux/amd64 node:16-alpine
WORKDIR /app
RUN apk add --update python3 make g++\ && rm -rf /var/cache/apk/*
RUN apk add --no-cache git
COPY . .
RUN npm ci
RUN npm run setup
RUN npm run build
CMD 'node -r ts-node/register ./packages/credential-governance/src/test-domain-hierarchy'
