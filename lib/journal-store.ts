// In-memory journal storage with enhanced categorization
export interface JournalEntry {
  id: string;
  content: string;
  timestamp: Date;
  tags?: string[];
  category?: string;
}

class JournalStore {
  private entries: JournalEntry[] = [];

  addEntry(entry: Omit<JournalEntry, 'id' | 'timestamp'>): JournalEntry {
    const newEntry: JournalEntry = {
      ...entry,
      id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      // Auto-categorize if not provided
      category: entry.category || this.autoDetectCategory(entry.content),
      // Auto-tag if not provided
      tags: entry.tags || this.autoExtractTags(entry.content),
    };
    this.entries.push(newEntry);
    return newEntry;
  }

  private autoDetectCategory(content: string): string {
    const lower = content.toLowerCase();
    
    if (lower.includes('buy') || lower.includes('shopping') || lower.includes('store') || 
        lower.includes('supermarket') || lower.includes('grocery') || lower.includes('pick up')) {
      return 'shopping';
    }
    
    if (lower.includes('says') || lower.includes('quote') || lower.includes('"') || 
        lower.includes("'") || lower.includes('told me')) {
      return 'quotes';
    }
    
    if (lower.includes('remind') || lower.includes('remember') || lower.includes('don\'t forget')) {
      return 'reminders';
    }
    
    if (lower.includes('goal') || lower.includes('plan') || lower.includes('want to')) {
      return 'goals';
    }
    
    if (lower.includes('feeling') || lower.includes('think') || lower.includes('believe')) {
      return 'thoughts';
    }
    
    return 'general';
  }

  private autoExtractTags(content: string): string[] {
    const tags: string[] = [];
    const lower = content.toLowerCase();
    
    // Extract food items for shopping
    const foodItems = [
      'eggs', 'milk', 'bread', 'cheese', 'butter', 'yogurt', 'apples', 'bananas',
      'chicken', 'beef', 'fish', 'rice', 'pasta', 'tomatoes', 'onions', 'carrots',
      'potatoes', 'coffee', 'tea', 'sugar', 'salt', 'pepper', 'oil', 'flour'
    ];
    
    foodItems.forEach(item => {
      if (lower.includes(item)) {
        tags.push(item);
      }
    });
    
    // Extract names (people mentioned)
    const nameMatches = content.match(/([A-Z][a-z]+)\s+says?/g);
    if (nameMatches) {
      nameMatches.forEach(match => {
        const name = match.replace(/\s+says?/i, '');
        tags.push(name.toLowerCase());
      });
    }
    
    // Extract locations
    const locations = ['supermarket', 'store', 'mall', 'market', 'shop', 'office', 'home', 'work'];
    locations.forEach(location => {
      if (lower.includes(location)) {
        tags.push(location);
      }
    });
    
    return [...new Set(tags)]; // Remove duplicates
  }

  getAllEntries(): JournalEntry[] {
    return [...this.entries].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  searchEntries(query: string): JournalEntry[] {
    const lowerQuery = query.toLowerCase();
    return this.entries.filter(entry => 
      entry.content.toLowerCase().includes(lowerQuery) ||
      entry.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      entry.category?.toLowerCase().includes(lowerQuery)
    ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getEntriesByCategory(category: string): JournalEntry[] {
    return this.entries.filter(entry => 
      entry.category?.toLowerCase() === category.toLowerCase()
    ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getRecentEntries(limit: number = 10): JournalEntry[] {
    return [...this.entries]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  getShoppingList(): JournalEntry[] {
    return this.getEntriesByCategory('shopping');
  }

  getCategories(): string[] {
    const categories = new Set(this.entries.map(entry => entry.category).filter(Boolean) as string[]);
    return Array.from(categories).sort();
  }

  getStats() {
    return {
      totalEntries: this.entries.length,
      categories: this.getCategories().length,
      recentActivity: this.getRecentEntries(5),
    };
  }
}

// Singleton instance
export const journalStore = new JournalStore();

