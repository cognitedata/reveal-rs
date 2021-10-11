#!/usr/bin/env bash

export REACT_APP_I18N_PSEUDO="${REACT_APP_I18N_PSEUDO:-false}"
export REACT_APP_I18N_DEBUG="${REACT_APP_I18N_DEBUG:-true}"
export REACT_APP_LANGUAGE="${REACT_APP_LANGUAGE:-en}"

export REACT_APP_LOCIZE_PROJECT_ID="${REACT_APP_LOCIZE_PROJECT_ID:-b0fef6b6-5821-4946-9acc-cb9c41568a75}"
export REACT_APP_LOCIZE_API_KEY="${REACT_APP_LOCIZE_API_KEY:-f1f6b763-2c20-4e12-a1c5-c33f1a71cec2}"
export REACT_APP_LOCIZE_VERSION="latest"
export REACT_APP_MIXPANEL_TOKEN="${REACT_APP_MIXPANEL_TOKEN:-}"
export REACT_APP_MIXPANEL_DEBUG="${REACT_APP_MIXPANEL_DEBUG:-false}"
export HTTPS=${HTTPS:-true}

# Detect when console.error is used.
if [[ -z $REACT_APP_ENABLE_ERRORS ]]; then
  # Special values:
  #   break - trip the debugger on error
  #   flash - flash the screen red on error
  #   false - disable the feature (default)
  export REACT_APP_ENABLE_ERRORS='flash'
fi

echo ' '
echo '-> Starting FakeIdP service'
# ./scripts/start-fake-idp.sh &
# IDP_PID=$!

function cleanup {
  echo ' '
  echo '-> Stopping FAKE IDP services'
  echo ' '
  # kill $IDP_PID
}

trap cleanup EXIT

USER_ID=$(git config user.email) # ok since this is local only

REACT_APP_USER_ID=$USER_ID ../../node_modules/.bin/react-scripts --max-old-space-size=4096 start

EXIT_CODE=$?

exit $EXIT_CODE
