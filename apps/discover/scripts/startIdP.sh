#!/bin/bash

# when using this script locally, you need to get the private key (from last pass)
# and put it into this file in the root:
PRIVATE_KEY=$(cat "./private-keys/discover-e2e-$REACT_APP_E2E_CLUSTER.jwk-key.json")

# Run the final command
docker pull eu.gcr.io/cognitedata/fake-idp:latest
docker run -e IDP_CLUSTER=$REACT_APP_E2E_CLUSTER -p 8200:8200 -e PORT=8200 -e PRIVATE_KEY="$PRIVATE_KEY" eu.gcr.io/cognitedata/fake-idp:latest
