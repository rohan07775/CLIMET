FROM node:20-alpine

WORKDIR /app

# Copy dependency configs
COPY package.json ./

# Install packages with legacy peer deps for React 19 compatibility
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

EXPOSE 3000

# Run in dev mode for hackathon live rendering
CMD ["npm", "run", "dev"]
