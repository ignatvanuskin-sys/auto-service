import { describe, it, expect } from "vitest";
import { heuristicQualify, qualifyLead } from "@/lib/ai";

describe("heuristic fallback", () => {
  it("срочные симптомы → high", () => {
    expect(heuristicQualify("машина не заводится, стартер молчит").urgency).toBe("high");
    expect(heuristicQualify("дым из-под капота, перегрев").urgency).toBe("high");
  });

  it("обычные симптомы → medium + подсказка услуги + марка", () => {
    const q = heuristicQualify("стук спереди на кочках, Kia Rio 2019");
    expect(q.urgency).toBe("medium");
    expect(q.suggestedServiceSlug).toBe("remont-podveski");
    expect(q.make).toBe("kia");
  });

  it("qualifyLead без ключа возвращает фолбэк и никогда не бросает", async () => {
    const q = await qualifyLead("шипит кондиционер, не холодит");
    expect(q.suggestedServiceSlug).toBe("kondicioner");
    expect(q.confidence).toBeLessThanOrEqual(0.5);
  });
});
