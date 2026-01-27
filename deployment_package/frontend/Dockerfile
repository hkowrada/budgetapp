FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json yarn.lock* package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build for production
RUN npm run build

# Install serve to run the build
RUN npm install -g serve

EXPOSE 3000

# Serve the build folder
CMD ["serve", "-s", "build", "-l", "3000"]
