type URLPatternInput = string | URL;
type URLPatternOptions = Record<string, string | undefined>;

declare class URLPattern {
  constructor(input?: URLPatternInput, baseURL?: string);
  constructor(input?: URLPatternOptions, baseURL?: string);
  test(input?: string | URL, baseURL?: string): boolean;
}
