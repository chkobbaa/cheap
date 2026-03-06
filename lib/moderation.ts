export const BAD_WORDS = [
    // French
    "merde", "putain", "con", "connard", "connasse", "salope", "pd", "enculé", "foutre", "gueule", "bâtard", "pute",
    // English
    "fuck", "shit", "bitch", "asshole", "cunt", "dick", "pussy", "nigger", "faggot", "slut", "whore",
    // Tunisian / Arabic (latinized equivalents)
    "zeb", "zeby", "zebi", "nam", "3asba", "asba", "9a7ba", "qa7ba", "kahba", "zamel", "mnayek", "nayek", "ta7an", "tahan"
]

export function containsBadWords(text: string): boolean {
    if (!text) return false

    const normalizedText = text.toLowerCase()

    // We use word boundaries where possible, but for some slangs direct substring match might be safer
    // A simple approach is searching for the bad words separated by spaces or punctuation

    for (const word of BAD_WORDS) {
        // Escape word for regex
        const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        // Match word boundaries to avoid catching normal words (e.g. "con" inside "conversation")
        const regex = new RegExp(`\\b${escapedWord}\\b`, 'i')

        if (regex.test(normalizedText)) {
            return true
        }
    }

    return false
}
