# OpenKB - AI Knowledge Base

OpenKB is a scalable, AI-powered searchable knowledge base that allows users to upload PDFs, extract text, generate vector embeddings, and interact with their documents using Llama 3.1 via OpenRouter. Built with Next.js 15, Pinecone, and Tailwind CSS.

## Features

- **Document Upload**: Drag-and-drop PDF upload with progress tracking.
- **RAG Architecture**: Automatically chunks PDFs, generates embeddings, and upserts them to Pinecone.
- **AI Chat**: Natural language querying of uploaded documents using Llama 3.1.
- **Zero Hallucination Prompting**: AI is strictly instructed to answer ONLY from the retrieved context.
- **Modern UI**: Premium design with shadcn/ui, framer-motion, dark mode, and responsive layouts.
- **State Management**: Zustand for client-side document metadata persistence.

## Prerequisites

- Node.js 18+
- [OpenRouter Account](https://openrouter.ai/) for Llama 3.1
- [OpenAI Account](https://platform.openai.com/) for `text-embedding-3-small` embeddings
- [Pinecone Account](https://pinecone.io/) for Serverless Vector Database

## Setup Instructions

1. **Clone the repository**
   \`\`\`bash
   git clone <repo-url>
   cd openkb
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory and add the following:
   \`\`\`env
   OPENROUTER_API_KEY="your_openrouter_api_key"
   PINECONE_API_KEY="your_pinecone_api_key"
   PINECONE_INDEX="openkb"
   OPENAI_API_KEY="your_openai_api_key"
   \`\`\`

4. **Setup Pinecone Index**
   - Create a new index in Pinecone.
   - Name it `openkb` (or whatever you set in `.env.local`).
   - Dimensions: `1536` (OpenAI `text-embedding-3-small`).
   - Metric: `cosine`.

5. **Run the Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`
   Visit \`http://localhost:3000\` in your browser.

## Architecture Decisions

- **Vercel AI SDK**: Used for seamless streaming from OpenRouter to the client chat interface.
- **Zustand with Persist**: Chose Zustand for state management. Using local storage persistence prevents the need for a relational database for a simple document listing, ensuring the app remains fully serverless out-of-the-box.
- **Vector DB (Pinecone)**: Standard for Vercel edge/serverless compatibility.

## Deployment

This project is fully ready to be deployed on Vercel:
1. Push to GitHub.
2. Import project in Vercel.
3. Add the environment variables from `.env.local`.
4. Deploy.

---
Built as a demonstration of a modern AI SaaS product.
