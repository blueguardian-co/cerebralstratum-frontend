# Stage 1: Build Stage
FROM registry.redhat.io/rhel9/nodejs-22-minimal:latest AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --omit=dev

# Stage 2: Production Stage
FROM registry.redhat.io/rhel9/nodejs-22-minimal:latest AS runner

# Set working directory
WORKDIR /app

# Copy built application from builder
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# Specify ENV variables for production
ENV NODE_ENV=production
ENV PORT=3000

# Expose the application's port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]