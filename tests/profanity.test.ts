import { checkProfanity, sanitiseInput } from "@/lib/profanity";

describe("checkProfanity", () => {
  it("passes clean English text", () => {
    const result = checkProfanity("This is a clean opinion about politics.");
    expect(result.clean).toBe(true);
    expect(result.offendingWords).toHaveLength(0);
  });

  it("detects common English profanity", () => {
    const result = checkProfanity("This is fucking bad.");
    expect(result.clean).toBe(false);
  });

  it("detects l33t-speak obfuscation", () => {
    const result = checkProfanity("sh1t is bad");
    // Normalisation converts 1→i, so "sh1t" → "shit"
    expect(result.clean).toBe(false);
  });

  it("passes Bangla text without custom blacklist", () => {
    const result = checkProfanity("এটি একটি পরিষ্কার মতামত।");
    expect(result.clean).toBe(true);
  });

  it("is case-insensitive", () => {
    const result = checkProfanity("ASSHOLE is here");
    expect(result.clean).toBe(false);
  });
});

describe("sanitiseInput", () => {
  it("strips script tags", () => {
    const out = sanitiseInput('<script>alert("xss")</script>Hello');
    expect(out).toBe("Hello");
    expect(out).not.toContain("<script>");
  });

  it("strips HTML tags", () => {
    const out = sanitiseInput("<b>bold</b> text");
    expect(out).toBe("bold text");
  });

  it("trims whitespace", () => {
    const out = sanitiseInput("   hello   ");
    expect(out).toBe("hello");
  });

  it("preserves plain text", () => {
    const out = sanitiseInput("Hello world! 1+1=2");
    expect(out).toBe("Hello world! 1+1=2");
  });
});
