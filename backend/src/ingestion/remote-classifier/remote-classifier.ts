import { RemoteType } from "@prisma/client";
import { REMOTE_KEYWORDS } from "./remote-keywords";

const HYBRID_REGEX = [
  /hybrid/,
  /h[ií]brido/,
  /hybride/,
  /ibrido/,
  /flexible.*work/,
  /work.*flex/,
];
const REMOTE_REGEX = [
  /remote/,
  /remoto/,
  /à distance/,
  /telework/,
  /home\s?office/,
  /lavoro\s?da\s?remoto/,
  /trabajo\s?remoto/,
];

function normalizeText(text: string) {
    return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function matchesKeywords(text: string, keywords: string[]) {
  return keywords.some(keyword => text.includes(keyword));
}

function matchesRegex(text: string, patterns: RegExp[]) {
  return patterns.some(pattern => pattern.test(text));
}

export function classifyRemoteType(text: string): RemoteType {
    if (!text) return RemoteType.ONSITE;

    const normalized = normalizeText(text);

    if (matchesRegex(normalized, HYBRID_REGEX) || matchesKeywords(normalized, REMOTE_KEYWORDS.HYBRID)) return RemoteType.HYBRID;
    if (matchesRegex(normalized, REMOTE_REGEX) || matchesKeywords(normalized, REMOTE_KEYWORDS.REMOTE)) return RemoteType.REMOTE;
    return RemoteType.ONSITE;
}