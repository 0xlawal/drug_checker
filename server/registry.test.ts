import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import {
  comparePackageDetails,
  isValidIdentifier,
  normalizeIdentifier,
  verifyIdentifier,
  type RegistryRecord,
} from "./registry";
import * as db from "./db";

// Mock axios
vi.mock("axios");
// Mock registryDb
vi.mock("./db", () => ({
  registryDb: {
    getCachedRecord: vi.fn().mockResolvedValue(null),
    upsertRecord: vi.fn().mockResolvedValue(1),
    logVerification: vi.fn().mockResolvedValue(1),
    cleanupOldEvents: vi.fn().mockResolvedValue(undefined),
  },
}));

const mockRecord: RegistryRecord = {
  productName: "Example Tablet",
  activeIngredients: "Example ingredient",
  productCategory: "Drugs",
  nafdacNumber: "03-1450",
  form: "Tablet",
  routeOfAdministration: "Oral",
  strengths: "500 mg",
  applicantName: "Example Pharma",
  approvalDate: "2025-01-10",
  expiryDate: "2029-01-09",
  status: "Active",
};

describe("registry verification logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("normalizeIdentifier", () => {
    it("normalizes harmless whitespace and case differences", () => {
      expect(normalizeIdentifier("  a1 - 2345 ")).toBe("A1-2345");
      expect(normalizeIdentifier(" 03-1450 ")).toBe("03-1450");
      expect(normalizeIdentifier("nafdac-03-1450")).toBe("NAFDAC-03-1450");
    });

    it("handles empty strings", () => {
      expect(normalizeIdentifier("")).toBe("");
      expect(normalizeIdentifier("   ")).toBe("");
    });
  });

  describe("isValidIdentifier", () => {
    it("accepts valid NAFDAC numbers", () => {
      expect(isValidIdentifier("A1-2345")).toBe(true);
      expect(isValidIdentifier("03-1450")).toBe(true);
      expect(isValidIdentifier("NAFDAC-01-5713")).toBe(true);
      expect(isValidIdentifier("01/5713")).toBe(true);
    });

    it("rejects invalid formats", () => {
      expect(isValidIdentifier("A1 2345")).toBe(false);
      expect(isValidIdentifier("invalid!")).toBe(false);
      expect(isValidIdentifier("")).toBe(false);
      expect(isValidIdentifier("   ")).toBe(false);
    });
  });

  describe("comparePackageDetails", () => {
    it("returns no warnings when all fields match", () => {
      const warnings = comparePackageDetails(mockRecord, {
        productName: "Example Tablet",
        strength: "500 mg",
        form: "Tablet",
        applicantName: "Example Pharma",
      });
      expect(warnings).toEqual([]);
    });

    it("flags supplied package fields that do not match", () => {
      const warnings = comparePackageDetails(mockRecord, {
        productName: "Example Tablet",
        strength: "250 mg",
        form: "Capsule",
      });
      expect(warnings).toEqual([
        "The supplied strength does not match the registry record.",
        "The supplied dosage form does not match the registry record.",
      ]);
    });

    it("ignores case and whitespace differences", () => {
      const warnings = comparePackageDetails(mockRecord, {
        productName: "  example tablet  ",
        strength: "500 mg",
      });
      expect(warnings).toEqual([]);
    });

    it("does not warn when optional fields are not supplied", () => {
      const warnings = comparePackageDetails(mockRecord, {});
      expect(warnings).toEqual([]);
    });
  });

  describe("verifyIdentifier", () => {
    it("returns input_invalid without calling an upstream source", async () => {
      const result = await verifyIdentifier("not valid!");
      expect(result.state).toBe("input_invalid");
      expect(result.record).toBeNull();
      expect(result.disclaimer).toContain("does not certify");
      expect(axios.get).not.toHaveBeenCalled();
    });

    it("returns input_invalid for empty input", async () => {
      const result = await verifyIdentifier("");
      expect(result.state).toBe("input_invalid");
      expect(result.record).toBeNull();
    });

    it("queries Greenbook and returns a record on success", async () => {
      const mockGreenbookResponse = {
        data: {
          data: [
            {
              product_name: "Example Tablet",
              ingredient: { ingredient_name: "Example ingredient" },
              category_name: "Drugs",
              NAFDAC: "03-1450",
              form: { name: "Tablet" },
              route: { name: "Oral" },
              strength: "500 mg",
              applicant: { name: "Example Pharma" },
              approval_date: "2025-01-10",
              expiry_date: "2029-01-09",
              status: "Active",
            },
          ],
        },
      };

      vi.mocked(axios.get).mockResolvedValueOnce(mockGreenbookResponse);

      const result = await verifyIdentifier("03-1450");
      expect(result.state).toBe("registry_match");
      expect(result.record).not.toBeNull();
      expect(result.record?.nafdacNumber).toBe("03-1450");
      expect(result.record?.productName).toBe("Example Tablet");
      expect(result.cached).toBe(false);
    });

    it("returns unable_to_verify on network error", async () => {
      vi.mocked(axios.get).mockRejectedValueOnce(new Error("Network error"));

      const result = await verifyIdentifier("03-1450");
      expect(result.state).toBe("unable_to_verify");
      expect(result.record).toBeNull();
    });

    it("returns unable_to_verify on timeout", async () => {
      const timeoutError = new Error("timeout");
      (timeoutError as any).code = "ECONNABORTED";
      vi.mocked(axios.get).mockRejectedValueOnce(timeoutError);

      const result = await verifyIdentifier("03-1450");
      expect(result.state).toBe("unable_to_verify");
    });

    it("returns unable_to_verify on HTTP 500", async () => {
      const error = new Error("Server error");
      (error as any).response = { status: 500 };
      vi.mocked(axios.get).mockRejectedValueOnce(error);

      const result = await verifyIdentifier("03-1450");
      expect(result.state).toBe("unable_to_verify");
    });

    it("returns no_registry_match when no record is found", async () => {
      vi.mocked(axios.get).mockResolvedValueOnce({ data: { data: [] } });

      const result = await verifyIdentifier("99-9999");
      expect(result.state).toBe("no_registry_match");
      expect(result.record).toBeNull();
    });

    it("returns registry_match_warning for inactive records", async () => {
      const inactiveResponse = {
        data: {
          data: [
            {
              product_name: "Example Tablet",
              ingredient: { ingredient_name: "Example ingredient" },
              category_name: "Drugs",
              NAFDAC: "03-1450",
              form: { name: "Tablet" },
              route: { name: "Oral" },
              strength: "500 mg",
              applicant: { name: "Example Pharma" },
              approval_date: "2025-01-10",
              expiry_date: "2026-01-09",
              status: "Inactive",
            },
          ],
        },
      };

      vi.mocked(axios.get).mockResolvedValueOnce(inactiveResponse);

      const result = await verifyIdentifier("03-1450");
      expect(result.state).toBe("registry_match_warning");
      expect(result.record).not.toBeNull();
      expect(result.record?.status).toBe("Inactive");
    });

    it("returns unable_to_verify on malformed JSON", async () => {
      vi.mocked(axios.get).mockRejectedValueOnce(new Error("Unexpected token"));

      const result = await verifyIdentifier("03-1450");
      expect(result.state).toBe("unable_to_verify");
    });
  });
});