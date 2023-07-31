#!/usr/bin/env bash

cp -L -r $1/. $2 && find -L $2/index.html -type f | xargs sed -i 's,\/PUBLIC_URL_VALUE/sidecar.js,/sidecar.js,g'
find -L $2/index.html -type f | xargs sed -i 's,\/PUBLIC_URL_VALUE,PUBLIC_URL_VALUE,g'
find -L $2/assets/* -type f | xargs sed -i 's,\/PUBLIC_URL_VALUE,PUBLIC_URL_VALUE,g'
