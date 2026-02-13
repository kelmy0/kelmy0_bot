export class QueryHelpers {
  static safeLimit(limit: number, max: number = 1): number {
    return Math.min(Math.max(limit, 1), max);
  }

  static normalizeOrderBy(orderBy: string): "asc" | "desc" {
    return orderBy === "asc" ? "asc" : "desc";
  }
}
