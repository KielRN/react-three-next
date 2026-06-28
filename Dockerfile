# Use Node.js as the base image
FROM node:22-alpine AS deps

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine
# to understand why libc6-compat might be needed
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# Install dependencies
RUN \
    if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
    else npm i; \
    fi

# Builder stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Railway passes env vars as Docker build args — declare them so
# Next.js can inline NEXT_PUBLIC_* values into the client bundle.
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_GP_PRODUCT_ID
ARG NEXT_PUBLIC_GP_PRICE_MONTHLY
ARG NEXT_PUBLIC_GP_PRICE_ANNUAL
ARG NEXT_PUBLIC_GP_PRICE_SETUP
ARG NEXT_PUBLIC_CONTACT_WEBHOOK
ARG NEXT_PUBLIC_ROI_CALCULATOR_WEBHOOK
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID

ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_GP_PRODUCT_ID=$NEXT_PUBLIC_GP_PRODUCT_ID
ENV NEXT_PUBLIC_GP_PRICE_MONTHLY=$NEXT_PUBLIC_GP_PRICE_MONTHLY
ENV NEXT_PUBLIC_GP_PRICE_ANNUAL=$NEXT_PUBLIC_GP_PRICE_ANNUAL
ENV NEXT_PUBLIC_GP_PRICE_SETUP=$NEXT_PUBLIC_GP_PRICE_SETUP
ENV NEXT_PUBLIC_CONTACT_WEBHOOK=$NEXT_PUBLIC_CONTACT_WEBHOOK
ENV NEXT_PUBLIC_ROI_CALCULATOR_WEBHOOK=$NEXT_PUBLIC_ROI_CALCULATOR_WEBHOOK
ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID
ENV NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID

# Build the Next.js application
RUN npm run build

# Production stage
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/standalone ./

# Set ownership for security
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Start the application
CMD ["node", "server.js"]