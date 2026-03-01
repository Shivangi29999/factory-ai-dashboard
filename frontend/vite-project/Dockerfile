FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application
COPY . .

# Expose port
EXPOSE 5173

# Run the application
CMD ["npm", "run", "dev", "--", "--host"]
