// lib/types/credential.ts
export type Credential = {
  id: string;
  name: string;
  type: "OPENAI" | "ANTHROPIC" | "GEMINI";
  createdAt: Date;
  updatedAt: Date;
};

export enum CredentialType {
  OPENAI = "OPENAI",
  ANTHROPIC = "ANTHROPIC",
  GEMINI = "GEMINI",
}
