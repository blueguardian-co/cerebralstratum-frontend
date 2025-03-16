# Stage 1: Build Stage
FROM registry.redhat.io/rhel9/nodejs-22-minimal:latest AS builder

USER 0

WORKDIR /opt/app-root/src

COPY --chown=1001:0 --chmod=777 package.json package-lock.json ./

# We have to use --force, as Patternfly doesn't support react 19 yet.
RUN npm install --frozen-lockfile --force

COPY --chown=1001:0 . .

RUN npm run build

RUN npm prune --omit=dev --force

# Stage 2: Production Stage
FROM registry.redhat.io/rhel9/nodejs-22-minimal:latest AS runner

USER 1001

WORKDIR /opt/app-root/src

COPY --chmod=664 --from=builder /opt/app-root/src/next.config.ts ./
COPY --chmod=664 --from=builder /opt/app-root/src/package.json /opt/app-root/src/package-lock.json ./
COPY --chmod=664 --from=builder /opt/app-root/src/public ./public
COPY --chmod=664 --from=builder /opt/app-root/src/.next ./.next
COPY --chmod=664 --from=builder /opt/app-root/src/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
       CMD curl -s -f http://localhost:3000/ > /dev/null || exit 1

CMD ["npm", "start"]