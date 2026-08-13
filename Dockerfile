# syntax=docker/dockerfile:1.7
#
# Builds webApp/ (React + Vite) against the Kotlin/JS output of shared/ and
# serves the result as a static SPA on a Red Hat UBI nginx image, per the
# container image policy in .junie/guidelines.md.

########################################
# Stage 1 — Kotlin/JS shared library (production distribution)
########################################
FROM registry.access.redhat.com/ubi9/openjdk-21:1.21 AS shared-build
WORKDIR /workspace

USER root
COPY gradlew gradlew.bat build.gradle.kts settings.gradle.kts gradle.properties ./
COPY gradle/ gradle/
COPY shared/ shared/
COPY kotlin-js-store/ kotlin-js-store/
# settings.gradle.kts includes :composeApp, so Gradle configures its build
# script even when only a :shared task is requested; the Android Gradle
# plugin only needs the file to be present, not an installed Android SDK.
COPY composeApp/build.gradle.kts composeApp/build.gradle.kts

RUN chmod +x gradlew && \
    ./gradlew --no-daemon --no-configuration-cache \
      :shared:jsBrowserProductionLibraryDistribution

# The npm workspace in the root package.json points at the *development*
# library path (see README's local dev flow: jsBrowserDevelopmentLibraryDistribution
# + npm install/start). Swap the production output into that same path so
# `npm ci` picks it up unchanged — this only affects this build stage's
# filesystem, not local development.
RUN rm -rf shared/build/dist/js/developmentLibrary && \
    cp -r shared/build/dist/js/productionLibrary shared/build/dist/js/developmentLibrary

########################################
# Stage 2 — React/Vite web app
########################################
FROM registry.access.redhat.com/ubi9/nodejs-22 AS web-build
WORKDIR /workspace

USER root
COPY package.json package-lock.json ./
COPY webApp/package.json webApp/package.json
COPY --from=shared-build /workspace/shared/build/dist/js/developmentLibrary shared/build/dist/js/developmentLibrary

RUN npm ci

COPY webApp/ webApp/
RUN npm run build

########################################
# Stage 3 — static runtime (Red Hat UBI nginx, non-root)
########################################
FROM registry.access.redhat.com/ubi9/nginx-124 AS runtime

# Populated by the Tekton buildah task's BUILD_EXTRA_ARGS (.tekton/pipelinerun.yaml)
# from the pipeline's repo_url/revision params and a build-date task result.
# Left blank on local/manual builds — that's an expected signal the image
# didn't come from CI.
ARG VCS_URL
ARG VCS_REF
ARG IMAGE_VERSION
ARG BUILD_DATE

LABEL org.opencontainers.image.title="CEREBRAL STRATUM Frontend" \
      org.opencontainers.image.description="Web application that uses a Kotlin Multiplatform shared library" \
      org.opencontainers.image.vendor="blueguardian-co" \
      org.opencontainers.image.source="${VCS_URL}" \
      org.opencontainers.image.url="${VCS_URL}" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.version="${IMAGE_VERSION}" \
      org.opencontainers.image.created="${BUILD_DATE}"

USER root

COPY webApp/docker/nginx-spa.conf ${NGINX_DEFAULT_CONF_PATH}/spa-fallback.conf
COPY webApp/docker/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
COPY webApp/docker/env.js.template /opt/app-root/env.js.template
COPY --from=web-build /workspace/webApp/dist/ /opt/app-root/src/

RUN chmod +x /usr/local/bin/docker-entrypoint.sh && \
    mkdir -p /var/run/env-js && \
    chown -R 1001:0 /opt/app-root/src /opt/app-root/env.js.template /var/run/env-js && \
    chmod -R g=u /opt/app-root/src /opt/app-root/env.js.template /var/run/env-js

USER 1001
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
