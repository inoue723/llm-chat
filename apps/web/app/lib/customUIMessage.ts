import type { UIMessage } from "ai";

export type CustomUIMessage = UIMessage<
  {
    modelId: string;
  }, // metadata type
  {
    chatCreated: {
      chatId: string;
    };
  } // data parts type
>;