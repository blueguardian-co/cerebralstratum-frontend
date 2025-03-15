# Stage 1: Build Stage
FROM registry.redhat.io/rhel9/nodejs-22-minimal:latest AS builder

USER 1001

WORKDIR /opt/app-root/src

COPY --chown=1001:0 package.json package-lock.json ./

# We have to use --force, as Patternfly doesn't support react 19 yet.
RUN npm install --frozen-lockfile --force

COPY . .

RUN npm run build

RUN npm prune --omit=dev --force

# Stage 2: Production Stage
FROM registry.redhat.io/rhel9/nodejs-22-minimal:latest AS runner

USER 1001

WORKDIR /opt/app-root/src

COPY --from=builder /opt/app-root/src/next.config.js ./
COPY --from=builder /opt/app-root/src/package.json /opt/app-root/src/package-lock.json ./
COPY --from=builder /opt/app-root/src/public ./public
COPY --from=builder /opt/app-root/src/.next ./.next
COPY --from=builder /opt/app-root/src/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
       CMD curl -s -f http://localhost:3000/ > /dev/null || exit 1

CMD ["npm", "start"]