import "client-only";

export function getOrCreateDeviceId(): string {
	try {
		const key = "device_id";
		const existing = localStorage.getItem(key);
		if (existing && existing !== "undefined" && existing !== "null") {
			return existing;
		}
		const newId = crypto?.randomUUID ? crypto.randomUUID() : generateFallbackUuid();
		localStorage.setItem(key, newId);
		return newId;
	} catch {
		// In environments without localStorage or crypto, use a deterministic fallback in memory
		return generateFallbackUuid();
	}
}

function generateFallbackUuid(): string {
	// Very small fallback UUID generator (not RFC compliant, but stable enough)
	const s: string[] = [];
	const hex = "0123456789abcdef";
	for (let i = 0; i < 36; i++) {
		s[i] = hex.substr(Math.floor(Math.random() * 16), 1);
	}
	s[14] = "4";
	s[19] = hex.substr((parseInt(s[19]!, 16) & 0x3) | 0x8, 1);
	s[8] = s[13] = s[18] = s[23] = "-";
	return s.join("");
} 