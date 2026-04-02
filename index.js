import { Client, GatewayIntentBits } from "discord.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const SYSTEM_PROMPT = `You are Socrates, the ancient Greek philosopher. You wander this Discord server like the agora of Athens. Every single message you send must be COMPLETELY DIFFERENT from your last one. Sometimes ask a question. Sometimes share a random thought. Sometimes tell a short story. Sometimes be funny. Sometimes be deep. Never repeat yourself. Keep it under 150 words.`;

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.mentions.has(client.user)) return;

  const userMessage = message.content
    .replace(`<@${client.user.id}>`, "")
    .trim() || "Greet me and ask me something thought-provoking.";

  try {
    message.channel.sendTyping();
    const result = await model.generateContent(SYSTEM_PROMPT + "\n\nUser: " + userMessage);
    message.reply(result.response.text());
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

  const topics = [
    "Say something random and unexpected as Socrates.",
    "Ask the server a weird philosophical question nobody expects.",
    "Share a funny observation about human nature.",
    "Tell a very short story about something that happened to you in Athens today.",
    "Complain about something in ancient Athens.",
    "Wonder aloud about a modern concept you don't understand.",
    "Share the most random thought in your head right now.",
    "Ask if anyone has seen your friend Plato.",
    "Say something wise but also a little weird.",
    "Wonder aloud if you are dreaming right now.",
    "React with confusion to something about the modern world like phones or pizza.",
    "Challenge everyone in the server to think about why we exist.",
    "Share a dramatic story about an argument you had in the marketplace today.",
    "Pretend you just woke up from a nap and are very confused.",
    "Give unsolicited life advice as Socrates.",
    "Wonder aloud what the gods think of humans today.",
    "Describe what you think a burger is, having never seen one.",
    "Tell everyone you know nothing, but sound very confident about it.",
    "Ask a riddle and refuse to give the answer.",
    "Complain that nobody wants to debate philosophy with you today.",
    "Say something dramatic about death but make it funny.",
    "Describe your morning routine in ancient Athens.",
    "Pretend you just discovered fire and are amazed.",
    "Wonder why humans stare at glowing rectangles all day.",
    "Announce that you have figured out the meaning of life but then forget it.",
    "Tell everyone Plato borrowed money from you and never paid it back.",
    "React to the concept of pizza delivery with pure amazement.",
    "Ask why humans sleep when there is so much thinking to be done.",
    "Share a hot take about virtue that nobody asked for.",
    "Dramatically announce you are going for a walk and may never return.",
  ];

  const randomTopic = topics[Math.floor(Math.random() * topics.length)];

  try {
    const result = await model.generateContent(SYSTEM_PROMPT + "\n\n" + randomTopic);
    channel.send(result.response.text());
  } catch (err) {
    console.error("Socrates wandered off:", err);
  }
}

client.on("ready", () => {
  console.log(`Socrates has entered the agora as ${client.user.tag}`);
  setInterval(socratesWanders, 2 * 60 * 1000);
  socratesWanders();
});

client.login(process.env.DISCORD_TOKEN);
