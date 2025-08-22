import fs from "node:fs";
import path from "node:path";

const messageText = fs.readFileSync(
  path.join(import.meta.dirname, "mockMessage.txt"),
  "utf-8",
);

export function getMockChunks(messageId: string) {
  return createRandomChunks(messageText, messageId);
}

// メッセージをランダムなchunkに分割する関数
function createRandomChunks(text: string, messageId: string) {
  const chunks = [];
  let currentIndex = 0;

  chunks.push({ type: "text-start" as const, id: messageId });

  while (currentIndex < text.length) {
    // 20-40文字のランダムなchunkサイズを決定
    const chunkSize = Math.floor(Math.random() * 21) + 20;
    const endIndex = Math.min(currentIndex + chunkSize, text.length);
    const chunk = text.slice(currentIndex, endIndex);

    chunks.push({
      type: "text-delta" as const,
      id: messageId,
      delta: chunk,
    });

    currentIndex = endIndex;
  }

  chunks.push({ type: "text-end" as const, id: "text-1" });
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
