import { testUtils } from "better-auth/plugins";
import { Service } from "../di/decorators/service";
import blacklistConfig from "../utils/moderation/blacklist.json";
import normalizationConfig from "../utils/moderation/normalization.json";

// temporar pana schimbam la un fisier json sau cv
const BANNED_WORDS = ["spam", "scam", "offensive_word"];

export class ModerationError extends Error {
	constructor(public message: string) {
		super(message);
		this.name = "ModerationError";
		Object.setPrototypeOf(this, ModerationError.prototype);
	}
}

@Service()
export class ModerationService {
	private exactWordsRegex: RegExp;

	constructor() {
		// compile regex when service starts
		const wordsPattern = blacklistConfig.exactWords.join("|");
		this.exactWordsRegex = new RegExp(`\\b(${wordsPattern})\\b`, "i"); // "i" makes it case-insensitive
	}

	/**
	* Normalizes "leet-speak" characters to regular letters
	* e.g., "$c@m" becomes "scam"
	*/
	private normalizeText(text: string): string {
		let normalized = text.toLowerCase();

		// apply mapping
		for (const [target, symbols] of Object.entries(normalizationConfig.mappings)) {
			for (const symbol of symbols) {
				// escape special regex characters in the symbol (like $ or |)
				const escapedSymbol = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
				const regex = new RegExp(escapedSymbol, 'g');
				normalized = normalized.replace(regex, target);
			}
		}

		// remove characters that break up words (s.c.a.m, s-c-a-m)
		return normalized
			.replace(/[^a-z0-9\s]/g, "") // keep only lowercase letters
			.replace(/\s+/g, " ") // make every space a single space
			.trim();
	}

	/**
	 * Scans a string for inappropriate content.
	 * @returns result and flagged word (if applicable)
	 */
	public scanContent(text: string | null | undefined): {
		isClean: boolean;
		reason?: string
	} {
		if (!text || text.trim() === "") {
			return { isClean: true };
		}

		const normalizedText = this.normalizeText(text);

		// check exact words
		const words = normalizedText.split(/\s+/);
		if (this.exactWordsRegex.test(normalizedText)) {
			console.warn("[Moderation Service] Blocked due to exact word match");
			return { isClean: false, reason: "Inappropriate language detected" };
		}

		// check patterns
		for (const pattern of blacklistConfig.patterns) {
			const regex = new RegExp(pattern, "i");
			if (regex.test(normalizedText)) {
				console.warn(`[Moderation Service] Blocked due to pattern match: ${pattern}`);
				return { isClean: false, reason: "Suspicious phrase detected" };
			}
		}

		return { isClean: true };
	}
}
