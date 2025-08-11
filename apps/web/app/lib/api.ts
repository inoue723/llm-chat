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
