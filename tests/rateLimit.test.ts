import { rateLimit } from "@/lib/rateLimit";
import { NextRequest } from "next/server";

function makeRequest(ip = "1.2.3.4", path = "/api/test") {
  return new NextRequest(`http://localhost${path}`, {
    headers: { "x-forwarded-for": ip },
  });
}

describe("rateLimit", () => {
  it("allows requests within limit", () => {
    const req = makeRequest("10.0.0.1", "/api/a");
    const result = rateLimit(req, { windowMs: 60_000, max: 5 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("blocks requests over limit", () => {
    const ip = "10.0.0.2";
    const req = makeRequest(ip, "/api/b");
    const config = { windowMs: 60_000, max: 3 };

    // Exhaust the limit
    rateLimit(req, config);
    rateLimit(req, config);
    rateLimit(req, config);

    const result = rateLimit(req, config);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("tracks different IPs independently", () => {
    const r1 = rateLimit(makeRequest("192.168.0.1", "/api/c"), { windowMs: 60_000, max: 2 });
    const r2 = rateLimit(makeRequest("192.168.0.2", "/api/c"), { windowMs: 60_000, max: 2 });
    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
  });

  it("tracks different paths independently", () => {
    const ip = "10.10.10.10";
    const config = { windowMs: 60_000, max: 1 };
    rateLimit(makeRequest(ip, "/api/path1"), config);
    const result = rateLimit(makeRequest(ip, "/api/path2"), config);
    expect(result.allowed).toBe(true);
  });
});
