#!/bin/bash

# AI Services Setup Script for Craved Artisan
echo "🚀 Setting up AI services for Craved Artisan..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start AI services
echo "📦 Starting AI services with Docker Compose..."
docker compose -f docker-compose.ai.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

# Check Ollama
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "✅ Ollama is running"
else
    echo "❌ Ollama is not responding"
fi

# Check Receipt OCR
if curl -s http://localhost:9001/healthz > /dev/null; then
    echo "✅ Receipt OCR service is running"
else
    echo "❌ Receipt OCR service is not responding"
fi

# Check Insights
if curl -s http://localhost:9002/healthz > /dev/null; then
    echo "✅ Insights service is running"
else
    echo "❌ Insights service is not responding"
fi

# Pull required models
echo "📥 Pulling required AI models..."

# Pull Phi-3.5-mini
echo "Pulling Phi-3.5-mini model..."
curl -s http://localhost:11434/api/pull -d '{"name":"phi3.5:mini"}' || echo "⚠️  Failed to pull Phi-3.5-mini"

# Pull BGE-small
echo "Pulling BGE-small model..."
curl -s http://localhost:11434/api/pull -d '{"name":"bge-small"}' || echo "⚠️  Failed to pull BGE-small"

echo "🎉 AI services setup complete!"
echo ""
echo "Services available at:"
echo "  - Ollama: http://localhost:11434"
echo "  - Receipt OCR: http://localhost:9001"
echo "  - Insights: http://localhost:9002"
echo ""
echo "To stop services: docker compose -f docker-compose.ai.yml down"
echo "To view logs: docker compose -f docker-compose.ai.yml logs -f"
