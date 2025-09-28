# CrewNexus - Multi-Agent Orchestration Platform

🚀 **Build, manage, and monitor AI agent workflows with CrewAI and Cerebras AI integration**

## 🌟 Overview

CrewNexus is a sophisticated web application that combines CrewAI's powerful multi-agent orchestration capabilities with Cerebras AI's lightning-fast inference models. The platform enables users to create, manage, and monitor complex AI agent workflows through an intuitive web interface.

## ✨ Features

### 🧠 **Cerebras AI Integration**
- Lightning-fast inference with industry-leading AI models
- Real-time streaming responses
- Structured output with JSON schema enforcement
- Access to multiple models (Llama 4, Qwen 3, etc.)

### 🤖 **Multi-Agent Orchestration**
- Create specialized AI agents with custom roles and goals
- Coordinate teams of agents working together
- Support for sequential, parallel, and hierarchical workflows
- Visual workflow designer with drag-and-drop interface

### 📊 **Real-Time Monitoring**
- Live visualization of agent activities and communications
- Performance metrics and analytics dashboard
- Real-time workflow execution tracking
- Comprehensive logging and error handling

### 🎨 **Visual Workflow Designer**
- Drag-and-drop interface for creating workflows
- Real-time workflow visualization
- Interactive node-based workflow editor
- Visual debugging and optimization tools

### 🏢 **Enterprise Features**
- Multi-user support with role-based access control
- RESTful APIs for external system integration
- WebSocket support for real-time updates
- Comprehensive monitoring and alerting

## 🛠️ Technology Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **CrewAI** - Multi-agent orchestration framework
- **Cerebras Cloud SDK** - AI model integration
- **PostgreSQL** - Primary database
- **Redis** - Caching and session management
- **SQLAlchemy** - ORM and database management
- **Alembic** - Database migrations

### Frontend
- **Next.js 14** - React framework with App Router
- **React Flow** - Visual workflow designer
- **Framer Motion** - Animation library
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Data fetching and caching
- **Zustand** - State management
- **Recharts** - Data visualization

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **NGINX** - Reverse proxy and load balancing
- **Prometheus** - Metrics collection
- **Grafana** - Monitoring dashboards

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL 15+
- Redis 7+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/crewnexus.git
   cd crewnexus
   ```

2. **Set up environment variables**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

3. **Start the services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Development Setup

1. **Backend Development**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

2. **Frontend Development**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 📖 Usage

### Creating Your First Agent

1. Navigate to the Agents page
2. Click "Create Agent" or use a template
3. Configure the agent's basic information:
   - Name and role
   - Goal and backstory
   - AI model selection
4. Add specialized tools
5. Review and create the agent

### Building a Workflow

1. Go to the Workflows page
2. Click "Create Workflow"
3. Select a crew of agents
4. Define workflow tasks
5. Configure execution settings
6. Execute and monitor the workflow

### Monitoring Performance

1. Visit the Dashboard for real-time metrics
2. Use the Monitoring page for detailed analytics
3. View workflow visualizations
4. Track agent performance and resource usage

## 🏗️ Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (Next.js)     │◄──►│   (FastAPI)     │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   CrewAI Engine │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Cerebras AI    │
                       └─────────────────┘
```

### Component Architecture
- **Frontend**: React components with TypeScript
- **Backend**: FastAPI with async/await patterns
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Caching**: Redis for session management
- **Real-time**: WebSocket connections for live updates

## 📊 API Documentation

### Authentication
```bash
# Get API token
curl -X POST http://localhost:8000/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"username": "user", "password": "pass"}'
```

### Agents API
```bash
# List agents
curl http://localhost:8000/api/agents

# Create agent
curl -X POST http://localhost:8000/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Research Analyst",
    "role": "Senior Research Analyst",
    "goal": "Conduct comprehensive research",
    "backstory": "Experienced research analyst...",
    "agent_type": "researcher",
    "model_name": "llama-4-scout-17b-16e-instruct"
  }'
```

### Workflows API
```bash
# List workflows
curl http://localhost:8000/api/workflows

# Execute workflow
curl -X POST http://localhost:8000/api/workflows/{id}/execute \
  -H "Content-Type: application/json" \
  -d '{"inputs": {"topic": "AI Trends"}}'
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
# Application
APP_NAME=CrewNexus
DEBUG=false
SECRET_KEY=your-secret-key

# Database
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/crewnexus

# Redis
REDIS_URL=redis://localhost:6379

# Cerebras AI
CEREBRAS_API_KEY=your-cerebras-api-key
```

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📈 Monitoring

### Metrics
- CPU and memory usage
- Request/response times
- Error rates
- Agent execution metrics
- Token usage statistics

### Logging
- Structured JSON logging
- Different log levels (DEBUG, INFO, WARNING, ERROR)
- Centralized log aggregation
- Real-time log streaming

## 🔒 Security

### Authentication
- JWT-based authentication
- Role-based access control
- API rate limiting
- Secure password hashing

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration

## 🚀 Deployment

### Production Deployment
1. **Docker Compose**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. **Kubernetes**
   ```bash
   kubectl apply -f k8s/
   ```

3. **Cloud Platforms**
   - AWS ECS/Fargate
   - Google Cloud Run
   - Azure Container Instances

### Scaling
- Horizontal scaling with load balancers
- Database connection pooling
- Redis clustering
- Microservices architecture

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Development Guidelines
- Follow PEP 8 for Python code
- Use TypeScript for frontend
- Write comprehensive tests
- Document your changes
- Follow commit message conventions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [CrewAI](https://github.com/joaomdmoura/crewAI) for the multi-agent framework
- [Cerebras](https://cerebras.ai) for the AI inference platform
- [FastAPI](https://fastapi.tiangolo.com) for the web framework
- [Next.js](https://nextjs.org) for the React framework
- All the open-source contributors who made this possible

## 📞 Support

- **Documentation**: [https://docs.crewnexus.ai](https://docs.crewnexus.ai)
- **Issues**: [GitHub Issues](https://github.com/yourusername/crewnexus/issues)
- **Discord**: [CrewNexus Community](https://discord.gg/crewnexus)
- **Email**: support@crewnexus.ai

---

**Built with ❤️ by the CrewNexus team**