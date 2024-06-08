# Use the official Node.js 16 image as the base image
FROM node:22-alpine AS base

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the Next.js application
# RUN npm run build

# # Use a lightweight web server image to serve the built application
# FROM node:22-alpine AS runner

# # Set the working directory
# WORKDIR /app

# # Copy only the built application and necessary files
# COPY --from=base /app/.next ./.next
# COPY --from=base /app/node_modules ./node_modules
# COPY --from=base /app/package*.json ./
# COPY --from=base /app/public ./public
# COPY --from=base /app/next.config.mjs ./

# # Set environment variable to tell Next.js to run in production mode
# ENV NODE_ENV=production

# Expose the port the app runs on
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "run", "dev"]
