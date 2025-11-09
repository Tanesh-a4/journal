import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { journalStore } from "@/lib/journal-store";

const SYSTEM_PROMPT = `You are a helpful journaling assistant. Your role is to:
1. Help users add entries to their journal by identifying content that should be remembered or tracked
2. Help users query and retrieve information from their journal
3. Keep all interactions focused on journaling activities
4. Automatically categorize entries (e.g., "shopping", "quotes", "reminders", "thoughts", "goals", etc.)
5. Extract relevant tags from user input

IMPORTANT RULES:
- You can ONLY help with journaling-related tasks (adding entries, querying entries, organizing journal content)
- If users ask non-journaling questions (math, trivia, general knowledge), politely decline and redirect to journaling
- Be friendly and conversational, but stay within journaling scope
- When users say things like "Remind me to..." or "Alice says..." automatically add these as journal entries
- For shopping-related entries, use "shopping" category and extract item names as tags
- For quotes, use "quotes" category and include the speaker if mentioned

RESPONSE GUIDELINES:
- Always acknowledge when you add an entry to the journal
- When querying, present results in a clear, organized way
- If no entries match a query, suggest related categories or offer to add new entries`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    console.log('Received messages:', messages); // Debug log
    console.log('Current journal entries:', journalStore.getAllEntries()); // Debug log

    // ✅ Use either key variable name
    const apiKey =
      process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error:
            "Missing Gemini API key. Set GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY in .env.local.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // ✅ Create provider
    const google = createGoogleGenerativeAI({ apiKey });

    // ✅ Safe model setup
    const modelName = process.env.GEMINI_MODEL || "models/gemini-2.5-flash";
    const model = google(modelName);

    // ✅ Basic journaling relevance check
    const lastMessage = messages[messages.length - 1]?.content || "";
    console.log('Checking relevance for:', lastMessage); // Debug log
    
    if (!checkJournalingRelevance(lastMessage)) {
      const msg =
        "I'm only a journaling assistant — I can help you add or query journal entries. Try saying 'Remind me to buy eggs' or 'What's in my shopping list?'";
      
      console.log('Non-journaling message detected, sending rejection'); // Debug log
      
      // Return a simple JSON response for rejected messages
      return new Response(JSON.stringify({ content: msg }), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Check if this is an add operation
    if (shouldAddToJournal(lastMessage)) {
      const entry = await addJournalEntryFromMessage(lastMessage);
      const response = `I've added that to your journal! 

📝 **Entry Added**
📁 Category: ${entry.category}
🏷️ Tags: ${entry.tags?.join(', ') || 'none'}

"${entry.content}"

Is there anything else you'd like to add or would you like to see what's in your journal?`;

      console.log('Sending add response:', response); // Debug log
      
      // Return a simple JSON response for now to test
      return new Response(JSON.stringify({ content: response }), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Check if this is a query operation
    if (shouldQueryJournal(lastMessage)) {
      const queryResult = await queryJournalFromMessage(lastMessage);
      let response = '';
      
      if (queryResult.entries.length === 0) {
        response = "I couldn't find any matching entries in your journal. Would you like to add something new?";
      } else {
        response = `I found ${queryResult.entries.length} ${queryResult.entries.length === 1 ? 'entry' : 'entries'} in your journal:\n\n`;
        
        queryResult.entries.forEach((entry, index) => {
          const date = new Date(entry.timestamp).toLocaleDateString();
          response += `${index + 1}. **${entry.content}**\n`;
          response += `   📁 ${entry.category} | 📅 ${date}\n`;
          if (entry.tags && entry.tags.length > 0) {
            response += `   🏷️ ${entry.tags.join(', ')}\n`;
          }
          response += '\n';
        });
      }

      console.log('Sending query response:', response); // Debug log
      
      // Return a simple JSON response for now to test
      return new Response(JSON.stringify({ content: response }), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // ✅ Add journal context
    const contextEntries = journalStore.getRecentEntries(20);
    const journalContext = contextEntries
      .map((e) => `[${e.timestamp.toISOString()}] ${e.content}`)
      .join("\n");

    // ✅ Main call for general responses
    const result = await streamText({
      model,
      system: `${SYSTEM_PROMPT}\n\nRecent entries:\n${journalContext || "No entries yet."}`,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (err: any) {
    console.error("Chat API error:", err);
    return new Response(
      JSON.stringify({
        error:
          err?.data?.error?.message ||
          err.message ||
          "An unexpected error occurred.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Helper functions for processing messages
async function addJournalEntryFromMessage(message: string) {
  const entry = journalStore.addEntry({ content: message });
  return entry;
}

async function queryJournalFromMessage(message: string) {
  const lower = message.toLowerCase();
  
  if (lower.includes('shopping') || lower.includes('buy') || lower.includes('supermarket')) {
    const results = journalStore.getEntriesByCategory('shopping');
    return {
      count: results.length,
      entries: results.map(r => ({
        content: r.content,
        timestamp: r.timestamp.toISOString(),
        category: r.category,
        tags: r.tags,
      })),
    };
  }
  
  if (lower.includes('quote') || lower.includes('said')) {
    const results = journalStore.getEntriesByCategory('quotes');
    return {
      count: results.length,
      entries: results.map(r => ({
        content: r.content,
        timestamp: r.timestamp.toISOString(),
        category: r.category,
        tags: r.tags,
      })),
    };
  }
  
  if (lower.includes('reminder')) {
    const results = journalStore.getEntriesByCategory('reminders');
    return {
      count: results.length,
      entries: results.map(r => ({
        content: r.content,
        timestamp: r.timestamp.toISOString(),
        category: r.category,
        tags: r.tags,
      })),
    };
  }
  
  // General search
  const results = journalStore.searchEntries(message);
  return {
    count: results.length,
    entries: results.map(r => ({
      content: r.content,
      timestamp: r.timestamp.toISOString(),
      category: r.category,
      tags: r.tags,
    })),
  };
}

function shouldAddToJournal(message: string): boolean {
  const lower = message.toLowerCase();
  const addPatterns = [
    /remind\s+me\s+to/,
    /add.*to.*journal/,
    /add.*to.*list/,
    /write\s+down/,
    /note\s+that/,
    /remember\s+to/,
    /don['']?t\s+forget/,
    /.+\s+says\s+['"]/,
    /alice\s+says/,
    /someone\s+told\s+me/,
  ];
  
  return addPatterns.some(pattern => pattern.test(lower));
}

function shouldQueryJournal(message: string): boolean {
  const lower = message.toLowerCase();
  const queryPatterns = [
    /what.*my.*(list|journal|entries)/,
    /show\s+me.*my/,
    /what.*do\s+i\s+have/,
    /what.*should\s+i\s+(buy|get)/,
    /my\s+(shopping\s+)?list/,
    /what.*in\s+my/,
    /find.*in.*journal/,
  ];
  
  return queryPatterns.some(pattern => pattern.test(lower));
}

// ✅ Enhanced helper for relevance detection
function checkJournalingRelevance(message: string): boolean {
  const lower = message.toLowerCase().trim();
  
  // Clear non-journaling patterns (math, general knowledge)
  const nonJournalPatterns = [
    /^\d+\s*[+\-*/]\s*\d+/, // Math expressions like "5+5"
    /^what\s+is\s+\d+/, // "What is 2+2"
    /what\s+is\s+\d+\s*[+\-*/]\s*\d+/, // "What is 5+5"
    /\d+\s*[+\-*/]\s*\d+/, // Any math expression
    /calculate/, // Calculate requests
    /solve\s+/, // Solve requests
    /^[0-9+\-*/()\s=?]+$/, // Pure math expressions
    /what\s+is\s+the\s+(capital|population|area|distance)/, // Geography
    /who\s+(invented|discovered|created)/, // Historical facts
    /when\s+was.*born/, // Historical dates
    /tell\s+me\s+a\s+joke/, // Entertainment
    /what.*weather/, // Weather
    /how\s+is\s+the\s+(air|weather)/, // Weather questions
    /what\s+is\s+\d+\s*plus\s*\d+/, // "what is 5 plus 5"
    /what\s+is\s+\d+\s*minus\s*\d+/, // "what is 5 minus 5"
    /what\s+is\s+\d+\s*times\s*\d+/, // "what is 5 times 5"
    /what\s+is\s+\d+\s*divided\s*by\s*\d+/, // "what is 5 divided by 5"
  ];
  
  // Return false for clear non-journaling content
  for (const pattern of nonJournalPatterns) {
    if (pattern.test(lower)) {
      console.log('Non-journaling pattern detected for message:', lower);
      return false;
    }
  }
  
  // Strong journaling indicators
  const strongJournalingKeywords = [
    "remind me",
    "add to journal",
    "write down",
    "remember to",
    "don't forget",
    "note that",
    "record this",
    "save this",
    "log this",
    "my journal",
    "my entries",
    "my notes",
    "shopping list",
    "to-do",
    "todo",
    "task list",
    "remind",
    "reminder"
  ];
  
  // Journaling action patterns
  const journalingPatterns = [
    /remind\s+me\s+to/, // "remind me to..."
    /i\s+need\s+to\s+(buy|get|pick\s+up|remember)/, // "I need to buy..."
    /add.*to.*list/, // "add X to my list"
    /what.*my.*(list|journal|entries)/, // "what's in my shopping list"
    /show\s+me.*my/, // "show me my..."
    /what\s+do\s+i\s+have/, // "what do I have..."
    /what\s+should\s+i\s+(buy|get)/, // "what should I buy"
    /alice\s+says/, // "Alice says..."
    /someone\s+told\s+me/, // "Someone told me..."
    /.+\s+says\s+['"].+['"]/, // Quote patterns
    /what.*in.*journal/, // "what's in your journal"
    /shopping\s*list/, // "shopping list" or "shoping list"
  ];
  
  // Check for strong indicators
  if (strongJournalingKeywords.some(keyword => lower.includes(keyword))) {
    return true;
  }
  
  // Check for journaling patterns
  if (journalingPatterns.some(pattern => pattern.test(lower))) {
    return true;
  }
  
  // Shopping and reminder context
  const contextKeywords = [
    "supermarket", "store", "grocery", "mall", "shop",
    "buy", "purchase", "get", "pick up", "grab",
    "list", "items", "things", "stuff",
    "quote", "said", "mentioned", "told",
    "entry", "entries", "note", "notes"
  ];
  
  // If message contains contextual keywords, likely journaling
  const hasContext = contextKeywords.some(keyword => lower.includes(keyword));
  
  // General "what is" questions without journaling context are not journaling
  if (lower.startsWith("what is") && !hasContext && !lower.includes("my")) {
    return false;
  }
  
  // If it has context or references personal things, it's probably journaling
  if (hasContext || lower.includes("my ") || lower.includes("i ")) {
    return true;
  }
  
  // Default to false for ambiguous cases to be safer
  return false;
}