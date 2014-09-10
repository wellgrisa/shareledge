#!/bin/bash

mongod --fork --dbpath /data/db --logpath /data/db-log

# cp -r /src/public/* /src/assets

# grunt build

forever start -l /tmp/out.log -c "npm start" /src/

/bin/bash
