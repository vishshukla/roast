import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  const body = await request.json();

  if (body.type === "prompt") {
    return generatePrompt();
  } else if (body.type === "argument") {
    return generateArgument(body.prompt, body.side);
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

async function generatePrompt() {
  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 150,
      system: `You generate spicy, debatable "hot take" prompts for a party game.
Rules:
- One sentence, stated as a confident opinion (not a question)
- Should be fun and debatable, NOT offensive, political, or harmful
- Topics: food, pop culture, technology, daily life, hypotheticals, sports, work, social norms
- Vary between silly ("Cereal is a soup") and thought-provoking ("The 5-day work week will be obsolete by 2030")
- NEVER repeat. Be creative and surprising.
- Return ONLY the hot take text, nothing else. No quotes.`,
      messages: [
        {
          role: "user",
          content: "Generate one hot take prompt.",
        },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";
    return NextResponse.json({ text: text.trim() });
  } catch (e) {
    return NextResponse.json({ error: "Failed to generate prompt" }, { status: 500 });
  }
}

async function generateArgument(prompt: string, side: string) {
  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 250,
      system: `You are generating a debate argument for a party game.
Rules:
- Write a short, punchy argument (2-4 sentences, max 400 characters)
- Sound like a real person at a party, NOT like a formal essay
- Be persuasive but with personality — use humor, strong opinions, rhetorical questions
- Use casual language, contractions, maybe light sarcasm
- Don't be too polished — it should be believable as human-written
- Return ONLY the argument text, nothing else.`,
      messages: [
        {
          role: "user",
          content: `The hot take is: "${prompt}"\n\nWrite an argument ${side} this take.`,
        },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";
    return NextResponse.json({ text: text.trim() });
  } catch (e) {
    return NextResponse.json({ error: "Failed to generate argument" }, { status: 500 });
  }
}
