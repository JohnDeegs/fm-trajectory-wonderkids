import 'dotenv/config';
import { Telegraf } from 'telegraf';
import { initStorage, savePlayers, loadPlayers } from './storage';
import type { BotPlayer } from './storage';
import { botSearch } from './search';
import { formatResults, formatNoData, formatTop } from './format';

const BOT_TOKEN = process.env.BOT_TOKEN;
const GEMINI_KEY = process.env.GEMINI_KEY;

if (!BOT_TOKEN) throw new Error('BOT_TOKEN env var is required');
if (!GEMINI_KEY) throw new Error('GEMINI_KEY env var is required');

const bot = new Telegraf(BOT_TOKEN);

// Track which chat IDs are awaiting a file upload
const awaitingUpload = new Set<number>();

// ── /start ────────────────────────────────────────────────────────────────────
bot.start(ctx => {
  ctx.reply(
    'Welcome to FM Trajectory Bot!\n\n' +
    'Upload your scouting data from the web app, then search by natural language.\n\n' +
    '/upload — send your FM export JSON\n' +
    '/search <query> — find players (e.g. /search fast young strikers)\n' +
    '/top [n] — top N players by trajectory % (default 10)\n' +
    '/help — show all commands'
  );
});

// ── /help ─────────────────────────────────────────────────────────────────────
bot.help(ctx => {
  ctx.reply(
    'Commands:\n\n' +
    '/upload — send your FM export JSON file\n' +
    '/search <query> — natural language player search via Gemini AI\n' +
    '/top [n] — top N players by trajectory % (default 10, max 20)\n' +
    '/help — this message'
  );
});

// ── /upload ───────────────────────────────────────────────────────────────────
bot.command('upload', ctx => {
  awaitingUpload.add(ctx.chat.id);
  ctx.reply('Send me your FM export JSON file (exported from Settings in the web app).');
});

// ── Document handler (file upload) ────────────────────────────────────────────
bot.on('document', async ctx => {
  const chatId = ctx.chat.id;
  if (!awaitingUpload.has(chatId)) return;
  awaitingUpload.delete(chatId);

  const doc = ctx.message.document;
  if (!doc.file_name?.endsWith('.json')) {
    ctx.reply('Please send a .json file exported from the FM Trajectory web app.');
    return;
  }

  try {
    const file = await ctx.telegram.getFile(doc.file_id);
    if (!file.file_path) {
      ctx.reply('Could not retrieve the file. Please try again.');
      return;
    }

    const url = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`;
    const response = await fetch(url);
    if (!response.ok) {
      ctx.reply('Failed to download the file. Please try again.');
      return;
    }

    const text = await response.text();
    let players: unknown;
    try {
      players = JSON.parse(text);
    } catch {
      ctx.reply('Could not parse the JSON file. Make sure it was exported from FM Trajectory.');
      return;
    }

    if (!Array.isArray(players) || players.length === 0) {
      ctx.reply('The file appears to be empty or invalid.');
      return;
    }

    // Validate shape — check first item has required fields
    const sample = players[0] as Record<string, unknown>;
    if (!sample.uid || !sample.name || sample.trajectoryPct === undefined) {
      ctx.reply('This doesn\'t look like an FM Trajectory export. Missing required fields.');
      return;
    }

    await savePlayers(chatId, players as BotPlayer[]);
    ctx.reply(`Saved ${players.length.toLocaleString()} players. Use /search or /top to explore.`);
  } catch (err) {
    console.error('Upload error:', err);
    ctx.reply('Something went wrong processing the file. Please try again.');
  }
});

// ── /search ───────────────────────────────────────────────────────────────────
bot.command('search', async ctx => {
  const query = ctx.message.text.replace(/^\/search\s*/i, '').trim();
  if (!query) {
    ctx.reply('Usage: /search <query>\nExample: /search fast young strikers from Brazil');
    return;
  }

  const chatId = ctx.chat.id;
  const players = await loadPlayers(chatId);
  if (!players) {
    ctx.reply(formatNoData());
    return;
  }

  ctx.reply('Searching...');

  try {
    const { results, preFilteredCount } = await botSearch(query, players, GEMINI_KEY!);
    const text = formatResults(query, results, preFilteredCount, results.length);
    ctx.reply(text, { parse_mode: 'MarkdownV2' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Search failed.';
    if (msg.includes('quota') || msg.includes('429')) {
      ctx.reply('Gemini quota exhausted. Please try again later.');
    } else {
      ctx.reply(`Search error: ${msg}`);
    }
  }
});

// ── /top ──────────────────────────────────────────────────────────────────────
bot.command('top', async ctx => {
  const arg = ctx.message.text.replace(/^\/top\s*/i, '').trim();
  let n = parseInt(arg, 10);
  if (isNaN(n) || n < 1) n = 10;
  if (n > 20) n = 20;

  const chatId = ctx.chat.id;
  const players = await loadPlayers(chatId);
  if (!players) {
    ctx.reply(formatNoData());
    return;
  }

  const text = formatTop(players, n);
  ctx.reply(text, { parse_mode: 'MarkdownV2' });
});

// ── Launch ────────────────────────────────────────────────────────────────────
async function main() {
  await initStorage();
  console.log('Storage initialised.');

  await bot.launch();
  console.log('Bot running.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
