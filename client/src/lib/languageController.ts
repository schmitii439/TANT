/**
 * Language Controller
 * Implements German-first language behavior with English override
 */

export enum Language {
  German = 'de', 
  English = 'en'
}

// Track the active language
let activeLanguage: Language = Language.German;

// Track temporary English override
let temporaryEnglishOverride = false;

// Language pattern detection
const ENGLISH_PATTERNS = [
  'in english',
  'answer in english',
  'speak english',
  'response in english',
  'english please',
  'english response',
  'switch to english',
  'english language',
  'can you speak english',
  'talk to me in english',
  'i want english',
  'english translation',
  'english version'
];

const GERMAN_PATTERNS = [
  'auf deutsch',
  'antworte auf deutsch',
  'deutsch bitte',
  'sprich deutsch',
  'auf deutsch antworten',
  'wechsle zu deutsch',
  'deutsche sprache',
  'kannst du deutsch sprechen',
  'sprich mit mir auf deutsch',
  'ich möchte deutsch',
  'deutsche übersetzung',
  'deutsche version'
];

/**
 * Sets the active language for responses
 * @param language The language to set as active
 */
export function setActiveLanguage(language: Language): void {
  activeLanguage = language;
  console.log(`Language set to: ${language}`);
}

/**
 * Gets the currently active language
 * @returns The active language code
 */
export function getActiveLanguage(): Language {
  return activeLanguage;
}

/**
 * Activates a temporary English override for the next response only
 */
export function activateTemporaryEnglishOverride(): void {
  temporaryEnglishOverride = true;
}

/**
 * Consumes the temporary English override if active
 * @returns True if the override was active and consumed, false otherwise
 */
export function consumeTemporaryEnglishOverride(): boolean {
  if (temporaryEnglishOverride) {
    temporaryEnglishOverride = false;
    return true;
  }
  return false;
}

/**
 * Analyzes user input for language command triggers
 * @param input The user input message
 * @returns True if a language command was detected and processed
 */
export function detectLanguageCommand(input: string): boolean {
  const lowerInput = input.toLowerCase();

  // Check for English language request
  const isEnglishRequest = ENGLISH_PATTERNS.some(pattern => lowerInput.includes(pattern));
  
  // Check for German language request
  const isGermanRequest = GERMAN_PATTERNS.some(pattern => lowerInput.includes(pattern));

  if (isEnglishRequest) {
    // If there's a specific request for English, we set a temporary override
    // but will notify user that we typically respond in German
    activateTemporaryEnglishOverride();
    console.log('English language request detected');
    return true;
  } else if (isGermanRequest) {
    setActiveLanguage(Language.German);
    console.log('German language request detected');
    return true;
  }

  return false;
}

/**
 * Checks if the response should be in German regardless of input language
 * @param input The user input message
 * @returns True if the response should be in German
 */
export function shouldRespondInGerman(input: string): boolean {
  // If a temporary English override is active, consume it and allow English
  if (consumeTemporaryEnglishOverride()) {
    return true; // Still show reminder even with override
  }
  
  // Check if input explicitly requests English
  const lowerInput = input.toLowerCase();
  const isExplicitEnglishRequest = ENGLISH_PATTERNS.some(pattern => lowerInput.includes(pattern));
  
  // Only respond in German with reminder if explicit English request
  return isExplicitEnglishRequest;
}

/**
 * Gets the gentle reminder message for German-first behavior
 * @returns The reminder message in German
 */
export function getGermanLanguageReminder(): string {
  const reminders = [
    "Ich verstehe deine Anfrage auf Englisch, aber ich antworte standardmäßig auf Deutsch. Ich werde diese Anfrage auf Englisch beantworten, aber zukünftige Antworten werden auf Deutsch sein, es sei denn, du bittest mich ausdrücklich um eine englische Antwort.",
    
    "Hinweis: Meine Standardsprache ist Deutsch. Ich kann zwar auf Englisch antworten, kehre aber automatisch zu Deutsch zurück. Für englische Antworten bitte dies explizit erwähnen.",
    
    "Ich bearbeite diese Anfrage auf Englisch, aber ich bin so konfiguriert, dass ich standardmäßig auf Deutsch antworte. Für weitere englische Antworten bitte 'Antwort auf Englisch' bei jeder Anfrage hinzufügen."
  ];
  
  return reminders[Math.floor(Math.random() * reminders.length)];
}

/**
 * Transforms the AI prompt to enforce German response if needed
 * @param prompt The original prompt
 * @returns Modified prompt with language instruction
 */
export function transformPromptForLanguage(prompt: string): string {
  // If a temporary English override is active, allow English response
  if (temporaryEnglishOverride) {
    temporaryEnglishOverride = false;
    return `Bitte antworte auf Englisch auf folgende Anfrage: ${prompt}`;
  }
  
  // Otherwise use the active language
  if (activeLanguage === Language.German) {
    // For German, explicitly request German regardless of input language
    return `Bitte antworte auf Deutsch auf folgende Anfrage, auch wenn die Anfrage auf Englisch ist: ${prompt}`;
  }
  
  // For English, pass through without language instruction
  return prompt;
}

/**
 * Applies language transformation to messages sent to AI models
 * @param messages The array of message objects
 * @returns Modified message array with language instruction
 */
export function transformMessagesForLanguage(messages: any[]): any[] {
  if (!Array.isArray(messages) || messages.length === 0) {
    return messages;
  }
  
  // Clone the array to avoid modifying the original
  const modifiedMessages = [...messages];
  
  // Find the system message if it exists
  const systemMessageIndex = modifiedMessages.findIndex(msg => msg.role === 'system');
  
  // Language instruction to add
  const languageInstruction = activeLanguage === Language.German
    ? "\nWichtig: Du antwortest immer auf Deutsch, auch wenn die Anfrage auf Englisch ist."
    : "";
  
  if (systemMessageIndex >= 0) {
    // Add language instruction to existing system message
    modifiedMessages[systemMessageIndex] = {
      ...modifiedMessages[systemMessageIndex],
      content: modifiedMessages[systemMessageIndex].content + languageInstruction
    };
  } else {
    // Add a new system message with language instruction
    modifiedMessages.unshift({
      role: 'system',
      content: `Du bist ein hilfreicher Assistent.${languageInstruction}`
    });
  }
  
  // If temporary English override is active, modify the last user message
  if (temporaryEnglishOverride) {
    const lastUserMessageIndex = modifiedMessages
      .map((msg, index) => ({ role: msg.role, index }))
      .filter(msg => msg.role === 'user')
      .pop()?.index;
      
    if (lastUserMessageIndex !== undefined) {
      const lastUserMessage = modifiedMessages[lastUserMessageIndex];
      modifiedMessages[lastUserMessageIndex] = {
        ...lastUserMessage,
        content: `${lastUserMessage.content}\n\n[Please respond in English]`
      };
    }
    
    // Consume the override
    temporaryEnglishOverride = false;
  }
  
  return modifiedMessages;
}