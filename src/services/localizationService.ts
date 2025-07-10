import fs from "fs";
import path from "path";

type Messages = Record<string, string>;
const messages: Record<string, Messages> = {};

["en", "sk"].forEach((lang) => {
  const filePath = path.join(__dirname, `../locales/${lang}.json`);
  messages[lang] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
});

export type MessageKey = keyof (typeof messages)["en"];

export function getMessage(lang: string | undefined, key: MessageKey): string {
  const language = lang === "sk" ? "sk" : "en";
  return messages[language][key] || messages["en"][key] || "Unknown message";
}
