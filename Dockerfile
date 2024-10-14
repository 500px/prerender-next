FROM node:18.20.4
ADD prerender-next.tar.gz /application/
WORKDIR /application/prerender-next/
CMD yarn start
