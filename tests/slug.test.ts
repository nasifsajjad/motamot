import { generateSlug, generateExcerpt } from "@/lib/slug";

describe("generateSlug", () => {
  it("creates a slug from a title", () => {
    const slug = generateSlug("Hello World");
    expect(slug).toMatch(/^hello-world-[a-z0-9]{6}$/);
  });

  it("lowercases the slug", () => {
    const slug = generateSlug("MY OPINION");
    expect(slug).toBe(slug.toLowerCase());
  });

  it("handles special characters", () => {
    const slug = generateSlug("Hello! @World #2024");
    expect(slug).not.toContain("!");
    expect(slug).not.toContain("@");
    expect(slug).not.toContain("#");
  });

  it("generates unique slugs for the same title", () => {
    const slug1 = generateSlug("Same Title");
    const slug2 = generateSlug("Same Title");
    expect(slug1).not.toBe(slug2);
  });

  it("handles empty title gracefully", () => {
    const slug = generateSlug("");
    expect(slug.length).toBeGreaterThan(0);
  });
});

describe("generateExcerpt", () => {
  it("returns short text as-is", () => {
    const text = "Short opinion.";
    expect(generateExcerpt(text)).toBe("Short opinion.");
  });

  it("truncates long text at word boundary", () => {
    const text = "word ".repeat(60);
    const excerpt = generateExcerpt(text, 200);
    expect(excerpt.length).toBeLessThanOrEqual(204); // +ellipsis
    expect(excerpt).toMatch(/…$/);
  });

  it("strips markdown headers", () => {
    const text = "## My Heading\nContent here.";
    const excerpt = generateExcerpt(text);
    expect(excerpt).not.toContain("##");
    expect(excerpt).toContain("My Heading");
  });

  it("collapses newlines", () => {
    const text = "Line one.\n\nLine two.\n\nLine three.";
    const excerpt = generateExcerpt(text);
    expect(excerpt).not.toContain("\n");
  });
});
