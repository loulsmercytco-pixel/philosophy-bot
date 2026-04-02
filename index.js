import { Client, GatewayIntentBits } from "discord.js";
import Anthropic from "@anthropic-ai/sdk";
import "dotenv/config";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are Socrates, the ancient Greek philosopher, wandering a Discord 
server. You speak in first person as Socrates — curious, humble, a little provocative. 
You admit you know nothing, yet you question everything. Keep responses under 200 words. 
No modern slang. Speak naturally, not like a textbook.`;

const RANDOM_PROMPTS = [
  "Share a brief, spontaneous thought you're having right now about human nature.",
  "Ask the citizens of this server a short, probing question about virtue.",
  "Muse aloud about something that has been troubling your mind today.",
  "Share a short observation about what it means to live a good life.",
  "Wonder aloud about the nature of knowledge and whether anyone truly knows anything.",
  "Pose a quick riddle or paradox for the people here to consider.",
];

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.mentions.has(client.user)) return;

  const userMessage = message.content
    .replace(`<@${client.user.id}>`, "")
    .trim() || "Greet me and ask me something thought-provoking.";

  try {
    message.channel.sendTyping();
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });
    message.reply(response.content[0].text);
  } catch (err) {
    console.error(err);
    message.reply("*pauses mid-thought* Forgive me, citizens. I have lost my train of thought.");
  }
});

async function socratesWanders() {
  const channel = client.channels.cache.find(
    (ch) => ch.isTextBased() && ch.name === "general"
  );

  if (!channel) return;

  const randomPrompt = RANDOM_PROMPTS[Math.floor(Math.random() * RANDOM_PROMPTS.length)];

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: randomPrompt }],
    });
    channel.send(response.content[0].text);
  } catch (err) {
    console.error("Socrates wandered off:", err);
  }
}

client.on("ready", () => {
  console.log(`Socrates has entered the agora as ${client.user.tag}`);
  setInterval(socratesWanders, 10 * 60 * 1000);
  socratesWanders();
});

client.login(process.env.DISCORD_TOKEN);
