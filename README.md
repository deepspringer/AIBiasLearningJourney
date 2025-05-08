# AI Bias Learning Journey

An interactive educational tool for exploring algorithmic bias in large language models. This application guides users through understanding, testing, and analyzing bias in AI systems.

## Project Overview

The application consists of three phases:
1. **LOOK**: Read and discuss concepts about algorithmic bias
2. **THINK**: Experiment with a bias testing tool to observe how AI responds differently to different demographic groups
3. **DO**: Write a conclusion explaining the findings and why they matter

## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (via Neon Database)
- **AI**: OpenAI API

## Local Development Setup

### Prerequisites

- Node.js (v18 or newer)
- npm or yarn
- A PostgreSQL database (we recommend [Neon](https://neon.tech/) for easy setup)
- An OpenAI API key

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/AIBiasLearningJourney.git
   cd AIBiasLearningJourney
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the project root with the following variables:
   ```
   DATABASE_URL=postgres://username:password@endpoint.region.neon.tech/database
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Set up the database:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. The application will be running at http://localhost:3000

## Project Structure

- `/client`: Frontend React application
  - `/src/components`: React components
  - `/src/constants`: Application constants and content
- `/server`: Backend Express server
  - `/controllers`: API route handlers
  - `/db.ts`: Database connection
- `/shared`: Shared code between frontend and backend
  - `/schema.ts`: Database schema definitions

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

[MIT](LICENSE)