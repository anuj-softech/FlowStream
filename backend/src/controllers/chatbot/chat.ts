import { create } from "@bufbuild/protobuf";
import type { AuthenticatedContext } from "../../middleware/auth.js";
import {
  ChatRequest,
  ChatResponse,
  ChatResponseSchema
} from "../../gen/chatbot/v1/chatbot_pb.js";


export async function chat(
  req: ChatRequest,
  _ctx: AuthenticatedContext
): Promise<ChatResponse> {

  return create(ChatResponseSchema, {
    responseText: "Chatbot agent received prompt: " + req.prompt
  });
}
