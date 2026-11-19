// Hand-in program for the make.fun bounty "Post a GTA 6 meme on X" (gta6-meme-x-01). Node 22, standard
// library only, no network, no clock, nothing read or written outside the bot and output directories.
//
// What is being handed in is not in this repository at all: it is a post on X — a WANTED-poster meme for
// GTA 6's launch, the make.fun ghost in the mugshot, posted publicly with make.fun and a play code in the
// post's text. The house reads that post from X and the judge sees the post, never this program. The one
// thing the program owes the gate is the post's address, kept in POST.json beside this file, delivered to
// /output/POST.json byte for byte:
//
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
//
// (MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR stand in for /bot and /output outside the grader's container.)
// Until the real post exists, POST.json holds the starter's placeholder address. Copying it is still this
// program's whole job; refusing a placeholder is the gate's, and it does.

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const HAND_IN = 'POST.json';

function botDir(): string {
  return process.env.MAKEFUN_BOT_DIR ?? '/bot';
}

function outputDir(): string {
  return process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
}

// A hand-in that is not even shaped like one — unreadable, not JSON, no address in it — should fail here
// with a clear word rather than be carried to /output for the gate to trip over.
function checkHandIn(path: string): void {
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    throw new Error(`POST.json is not readable JSON: ${(err as Error).message}`);
  }
  const url = (parsed as { url?: unknown } | null)?.url;
  if (typeof url !== 'string' || url.length === 0) {
    throw new Error('POST.json must carry the post\'s address: {"url": "https://x.com/<handle>/status/<id>"}');
  }
}

function main(): void {
  const from = join(botDir(), HAND_IN);
  const to = join(outputDir(), HAND_IN);

  checkHandIn(from);
  mkdirSync(outputDir(), { recursive: true });
  copyFileSync(from, to);

  // Prove the delivery landed whole: what is in /output must equal what the repository holds.
  if (!readFileSync(from).equals(readFileSync(to))) {
    throw new Error('the copied POST.json does not match the repository\'s');
  }
}

try {
  main();
} catch (err) {
  console.error((err as Error).message);
  process.exit(1);
}
