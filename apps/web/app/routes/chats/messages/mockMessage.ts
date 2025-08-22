import fs from "node:fs";
import path from "node:path";

let messageText = "";

if (process.env.NODE_ENV === "development") {
  messageText = fs.readFileSync(
    path.join(import.meta.dirname, "mockMessage.txt"),
    "utf-8",
  );
} else {
  messageText = "";
}

export function getMockChunks(messageId: string) {
  return createRandomChunks(messageText, messageId);
}

// メッセージをランダムなchunkに分割する関数
function createRandomChunks(text: string, messageId: string) {
  const chunks = [];
  let currentIndex = 0;

  chunks.push({ type: "text-start" as const, id: messageId });

  while (currentIndex < text.length) {
    // 30-50文字のランダムなchunkサイズを決定
    const chunkSize = Math.floor(Math.random() * 21) + 30;
    const endIndex = Math.min(currentIndex + chunkSize, text.length);
    const chunk = text.slice(currentIndex, endIndex);

    chunks.push({
      type: "text-delta" as const,
      id: messageId,
      delta: chunk,
    });

    currentIndex = endIndex;
  }

  chunks.push({ type: "text-end" as const, id: messageId });
  chunks.push({
    type: "finish" as const,
    finishReason: "stop" as const,
    usage: {
      inputTokens: 10,
      outputTokens: text.length,
      totalTokens: 10 + text.length,
    },
  });

  return chunks;
}
