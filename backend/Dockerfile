# Use the exact Python version you need
FROM python:3.12.7-slim

# Set working directory
WORKDIR /app

# Copy your backend code
COPY . /app

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the Render port (Render sets $PORT automatically)
EXPOSE 8080

# Start the FastAPI app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
