FROM docker.bravi.com.br/node-mongo-base

ENV TIMEZONE Brazil/East
RUN /usr/local/bin/setup_timezone

ENV NODE_ENV production

ADD . /src
# ADD .bowerrc /src/.bowerrc
WORKDIR /src

# forces install all dependences
RUN cd /src; npm --unsafe-perm install

ADD ./infra/production/docker.sh /docker.sh
RUN chmod +x /docker.sh

EXPOSE 3000
EXPOSE 27017

ENTRYPOINT ["/docker.sh"]
