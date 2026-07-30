/**
 * Reusable category, favorite, recent, compatibility, and alphabetical filters.
 */
export class VisualFilters {
  apply(items, { category = "all", favorites = false, recent = false, favoriteIds = [], recentIds = [], studio = null, alphabetical = true } = {}) {
    const favoriteSet = new Set(favoriteIds);
    const recentSet = new Set(recentIds);
    const filtered = items.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (favorites && !favoriteSet.has(item.id)) return false;
      if (recent && !recentSet.has(item.id)) return false;
      if (studio && !item.studios?.includes("*") && !item.studios?.includes(studio)) return false;
      return true;
    });
    if (recent) return [...filtered].sort((a, b) => recentIds.indexOf(a.id) - recentIds.indexOf(b.id));
    return alphabetical ? [...filtered].sort((a, b) => a.name.localeCompare(b.name)) : filtered;
  }
}
