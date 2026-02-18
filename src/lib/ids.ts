
// Simple, dependency-free string to UUID generator
// Ensures consistent UUID generation across environments (Edge, Node, Browser)

export function stringToUUID(str: string): string {
    // FNV-1a hash implementation
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }

    // Use the hash to generate a deterministic sequence
    let result = '';
    const hexChars = '0123456789abcdef';

    // Seed PRNG with the hash
    let seed = hash >>> 0;

    for (let i = 0; i < 32; i++) {
        // Mix in the string characters again to ensure distribution
        const charCode = str.charCodeAt(i % str.length) || 0;
        seed = Math.imul(seed ^ charCode, 1664525) + 1013904223;
        const val = (seed >>> 16) & 0x0F;

        result += hexChars[val];
    }

    // Format as UUID v4-ish
    // xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    // adjusting version (4) and variant (8,9,a,b)

    const variant = ((parseInt(result[16], 16) & 0x3) | 0x8).toString(16);

    return `${result.substring(0, 8)}-${result.substring(8, 12)}-4${result.substring(13, 16)}-${variant}${result.substring(17, 20)}-${result.substring(20, 32)}`.toLowerCase();
}

export const SYSTEM_IDS = {
    LOGIN: stringToUUID("SYSTEM_LOGIN"),
    LOGIN_INIT: stringToUUID("SYSTEM_LOGIN_INIT"),
    HEARTBEAT: stringToUUID("SYSTEM_HEARTBEAT"),
    REFLECTION: stringToUUID("SYSTEM_REFLECTION"),
    CHECKIN: stringToUUID("SYSTEM_CHECKIN"),
    EVIDENCE: stringToUUID("SYSTEM_EVIDENCE"),
    JOURNEY_MAP: stringToUUID("JOURNEY_MAP"),
};

// Helper to check if a UUID matches a specific SYSTEM ID or game ID
export function isMission(uuid: string, originalId: string): boolean {
    return uuid === stringToUUID(originalId);
}
