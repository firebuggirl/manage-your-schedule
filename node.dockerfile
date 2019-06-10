# Build: docker build -f node.dockerfile -t danwahlin/node .

# Option 1
# Start MongoDB and Node (link Node to MongoDB container with legacy linking)

# docker run -d --name my-snacks-mongodb mongo
# docker run -d -p 8000:8000 --link my-snacks-mongodb:mongodb --name nodeapp danwahlin/node

# Option 2: Create a custom bridge network and add containers into it

# docker network create --driver bridge isolated_network
# docker run -d --net=isolated_network --name mongodb mongo
# docker run -d --net=isolated_network --name nodeapp -p 8000:8000 danwahlin/node

# Seed the database with sample database
# Run: docker exec nodeapp node dbSeeder.js

FROM node:latest

MAINTAINER Juliette Tworsey

ENV NODE_ENV=development
ENV PORT=8000

COPY      . /var/www
WORKDIR   /var/www

RUN       npm install

EXPOSE $PORT

ENTRYPOINT ["npm", "start"]
