import type { Route } from "./+types/chats.$chatId.send";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatRequest {
  model: "gpt-4" | "claude-3" | "gemini-pro";
  messages: ChatMessage[];
}

export interface ChatResponse {
  success: boolean;
  data?: {
    id: string;
    content: string;
    role: "assistant";
    timestamp: string;
  };
  error?: string;
}

class LLMService {
  private apiKeys: {
    openai?: string;
    claude?: string;
    google?: string;
  };

  constructor(env: any) {
    this.apiKeys = {
      openai: env.OPENAI_API_KEY,
      claude: env.CLAUDE_API_KEY,
      google: env.GOOGLE_API_KEY,
    };
  }

  async sendMessage(model: string, messages: ChatMessage[]): Promise<string> {
    switch (model) {
      case "gpt-4":
        return this.callOpenAI(messages);
      case "claude-3":
        return this.callClaude(messages);
      case "gemini-pro":
        return this.callGemini(messages);
      default:
        throw new Error(`Unsupported model: ${model}`);
    }
  }

  private async callOpenAI(messages: ChatMessage[]): Promise<string> {
    if (!this.apiKeys.openai) {
      throw new Error("OpenAI API key not configured");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKeys.openai}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: messages,
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenAI API error: ${response.status} - ${errorData.error?.message || "Unknown error"}`,
      );
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "No response generated";
  }

  private async callClaude(messages: ChatMessage[]): Promise<string> {
    if (!this.apiKeys.claude) {
      throw new Error("Claude API key not configured");
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": this.apiKeys.claude,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 4000,
        messages: messages.filter((m) => m.role !== "system"),
        system: messages.find((m) => m.role === "system")?.content,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Claude API error: ${response.status} - ${errorData.error?.message || "Unknown error"}`,
      );
    }

    const data = await response.json();
    return data.content[0]?.text || "No response generated";
  }

  private async callGemini(messages: ChatMessage[]): Promise<string> {
    if (!this.apiKeys.google) {
      throw new Error("Google API key not configured");
    }

    const prompt = messages.map((m) => `${m.role}: ${m.content}`).join("\n\n");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKeys.google}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4000,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Gemini API error: ${response.status} - ${errorData.error?.message || "Unknown error"}`,
      );
    }

    const data = await response.json();
    return (
      data.candidates[0]?.content?.parts[0]?.text || "No response generated"
    );
  }
}

export async function action({
  request,
  params,
  context,
}: Route.ActionArgs): Promise<ChatResponse> {
  if (request.method !== "POST") {
    return {
      success: false,
      error: "Method not allowed",
    };
  }

  try {
    const formData = await request.formData();
    const model = formData.get("model") as string;
    const messagesStr = formData.get("messages") as string;
    const messages: ChatMessage[] = JSON.parse(messagesStr);
    const { chatId } = params;

    if (!model || !messages || !Array.isArray(messages)) {
      return {
        success: false,
        error: "Invalid request format",
      };
    }

    if (!chatId) {
      return {
        success: false,
        error: "Chat ID is required",
      };
    }

    const llmService = new LLMService(process.env);
    const responseContent = await llmService.sendMessage(model, messages);

    return {
      success: true,
      data: {
        id: `msg-${Date.now()}-assistant`,
        content: responseContent,
        role: "assistant",
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("Chat API error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
