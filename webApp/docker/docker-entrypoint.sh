#!/bin/sh
# Renders env.js from the template (ADR-0006) using the container's
# environment, then hands off to the real entrypoint (nginx).
set -eu

# Written to a dedicated writable path — not the (otherwise static) docroot —
# so a readOnlyRootFilesystem deployment only needs one small volume mounted
# over /var/run/env-js, instead of one over the whole app that would shadow
# the static assets baked into the image at /opt/app-root/src.
envsubst '${KEYCLOAK_URL} ${KEYCLOAK_REALM} ${KEYCLOAK_CLIENT_ID} ${BACKEND_API} ${MAPBOX_ACCESS_TOKEN}' \
  < /opt/app-root/env.js.template \
  > /var/run/env-js/env.js

exec "$@"