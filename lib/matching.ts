export interface MatchResult {
  postId: string;
  score: number;
  mutual: boolean;
  offerOverlap: string[];
  seekOverlap: string[];
}

/**
 * Compute match score between two posts.
 * Score = # of overlapping keywords in both directions.
 * Mutual = both sides have at least one overlap.
 */
export function computeMatchScore(
  postA: { offerKeywords: string[]; seekKeywords: string[] },
  postB: { offerKeywords: string[]; seekKeywords: string[] }
): { score: number; mutual: boolean; offerOverlap: string[]; seekOverlap: string[] } {
  const normalize = (k: string) => k.toLowerCase().trim();

  const aOffer = postA.offerKeywords.map(normalize);
  const aSeek = postA.seekKeywords.map(normalize);
  const bOffer = postB.offerKeywords.map(normalize);
  const bSeek = postB.seekKeywords.map(normalize);

  // What A seeks ↔ what B offers
  const seekOverlap = aSeek.filter((k) => bOffer.includes(k));
  // What B seeks ↔ what A offers
  const offerOverlap = aOffer.filter((k) => bSeek.includes(k));

  const score = seekOverlap.length + offerOverlap.length;
  const mutual = seekOverlap.length > 0 && offerOverlap.length > 0;

  return { score, mutual, offerOverlap, seekOverlap };
}

/**
 * Given a source post and a list of candidate posts,
 * return ranked matches (mutual first, then partial).
 */
export function rankMatches(
  sourcePost: { id: string; offerKeywords: string[]; seekKeywords: string[] },
  candidates: { id: string; offerKeywords: string[]; seekKeywords: string[] }[]
): MatchResult[] {
  const results: MatchResult[] = [];

  for (const candidate of candidates) {
    if (candidate.id === sourcePost.id) continue;
    const { score, mutual, offerOverlap, seekOverlap } = computeMatchScore(
      sourcePost,
      candidate
    );
    if (score > 0) {
      results.push({ postId: candidate.id, score, mutual, offerOverlap, seekOverlap });
    }
  }

  // Sort: mutual first, then by score descending
  return results.sort((a, b) => {
    if (a.mutual && !b.mutual) return -1;
    if (!a.mutual && b.mutual) return 1;
    return b.score - a.score;
  });
}
