# Journal Chat App

A beautiful chat interface for a journaling app built with Next.js, Vercel Generative UI SDK, and shadcn/ui components.

## Features

- ✨ Add journal entries through natural language prompts
- 🔍 Query your journal entries with questions
- 🛡️ Safeguards against hallucinations and off-topic queries
- 💾 In-memory storage (no database required)
- 🎨 Beautiful UI with shadcn/ui components

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Google Gemini API key (get one for free from [Google AI Studio](https://makersuite.google.com/app/apikey))

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory and add your Gemini API key:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

   Optionally, you can specify a different Gemini model:
```
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```

   **Note:** The default model is `gemini-2.5-flash` which is available in the free tier. You can also use `gemini-2.5-pro` if you have access to it.
   also run the 1.js file for listing all avaible models
4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Examples

### Adding Entries

- "Remind me to buy eggs next time I'm at the supermarket"
- "Alice says 'I should check out Kritunga for their awesome biryani'"
- "Note: Meeting with John tomorrow at 3pm"

### Querying Entries

- "What is my shopping list?"
- "I'm at the supermarket. What should I buy?"
- "Show me all my reminders"

## Technology Stack

- **Next.js 14** - React framework with App Router
- **Vercel AI SDK** - For streaming chat responses
- **Google Gemini** - Language model provider (free tier available)
- **shadcn/ui** - Beautiful UI components
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

## Project Structure

```
├── app/
│   ├── api/chat/route.ts    # Chat API endpoint with function calling
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Main chat interface
│   └── globals.css           # Global styles
├── components/
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── journal-store.ts      # In-memory journal storage
│   └── utils.ts              # Utility functions
└── package.json
```

## Safeguards

The app includes safeguards to prevent hallucinations and keep interactions focused on journaling:

- Checks if queries are journaling-related before processing
- Rejects mathematical calculations and general knowledge questions
- System prompt that enforces journaling-only scope
- Pattern matching to detect off-topic requests

## License

MIT

