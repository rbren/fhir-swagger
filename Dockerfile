FROM node:10
WORKDIR /usr/src/app
COPY . .
RUN npm install
ENTRYPOINT ["./bin/fhir-swagger"]