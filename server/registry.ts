import axios from "axios";
import { registryDb } from "./db";

export const GREENBOOK_URL = "https://greenbook.nafdac.gov.ng/";
export const GREENBOOK_RECORD_URL = "https://greenbook.nafdac.gov.ng/";

export type VerificationState =
  | "registry_match"
  | "registry_match_warning"
  | "no_registry_match"
  | "unable_to_verify"
  | "input_invalid";

export type PackageDetails = {
  productName?: string;
  strength?: string;
  form?: string;
  applicantName?: string;
};

export type RegistryRecord = {
  productName: string;
  activeIngredients: string;
  productCategory: string;
  nafdacNumber: string;
  form: string;
  routeOfAdministration: string;
  strengths: string;
  applicantName: string;
  approvalDate: string | null;
  expiryDate: string | null;
  status: string;
};

export type VerificationResult = {
  state: VerificationState;
  identifier: string;
  record: RegistryRecord | null;
  warnings: string[];
  source: {
    name: "NAFDAC Greenbook";
    url: string;
    retrievedAt: string;
    adapterVersion: string;
  };
  cached: boolean;
  cacheAgeSeconds: number;
  disclaimer: string;
};

type GreenbookRow = {
  product_name?: string;
  ingredient?: { ingredient_name?: string };
  category_name?: string;
  NAFDAC?: string;
  form?: { name?: string };
  route?: { name?: string };
  strength?: string;
  applicant?: { name?: string };
  approval_date?: string;
  expiry_date?: string;
  status?: string;
};

type GreenbookResponse = {
  data?: GreenbookRow[];
};

const ADAPTER_VERSION = "greenbook-datatables-v1";
const DISCLAIMER =
  "This result shows registry information only. It does not certify the physical product as genuine or safe.";

export function normalizeIdentifier(value: string): string {
  return value.trim().replace(/\s+/g, "").toUpperCase();
}

export function isValidIdentifier(value: string): boolean {
  return /^[A-Z0-9][A-Z0-9/-]{0,31}$/.test(value);
}

function clean(value: string | undefined): string {
  return (value ?? "").replace(/[#$]/g, "").replace(/\s+/g, " ").trim();
}

function comparable(value: string | undefined): string {
  return clean(value).toLocaleLowerCase().replace(/\s+/g, " ");
}

function mapRecord(row: GreenbookRow): RegistryRecord {
  return {
    productName: clean(row.product_name),
    activeIngredients: clean(row.ingredient?.ingredient_name),
    productCategory: clean(row.category_name),
    nafdacNumber: clean(row.NAFDAC),
    form: clean(row.form?.name),
    routeOfAdministration: clean(row.route?.name),
    strengths: clean(row.strength),
    applicantName: clean(row.applicant?.name),
    approvalDate: row.approval_date || null,
    expiryDate: row.expiry_date || null,
    status: clean(row.status) || "Unknown",
  };
}

export function comparePackageDetails(
  record: RegistryRecord,
  details: PackageDetails,
): string[] {
  const warnings: string[] = [];
  const comparisons: Array<[string, string | undefined, string, string]> = [
    ["product name", details.productName, record.productName, "productName"],
    ["strength", details.strength, record.strengths, "strength"],
    ["dosage form", details.form, record.form, "form"],
    ["applicant", details.applicantName, record.applicantName, "applicant"],
  ];

  for (const [label, supplied, official] of comparisons) {
    if (supplied && official && comparable(supplied) !== comparable(official)) {
      warnings.push(`The supplied ${label} does not match the registry record.`);
    }
  }

  return warnings;
}

function stateForRecord(record: RegistryRecord, warnings: string[]): VerificationState {
  if (record.status.toLocaleLowerCase() !== "active" || warnings.length > 0) {
    return "registry_match_warning";
  }
  return "registry_match";
}

function makeBaseResult(identifier: string, state: VerificationState): VerificationResult {
  return {
    state,
    identifier,
    record: null,
    warnings: [],
    source: {
      name: "NAFDAC Greenbook",
      url: GREENBOOK_URL,
      retrievedAt: new Date().toISOString(),
      adapterVersion: ADAPTER_VERSION,
    },
    cached: false,
    cacheAgeSeconds: 0,
    disclaimer: DISCLAIMER,
  };
}

function makeParams(identifier: string): Record<string, string> {
  const params: Record<string, string> = {
    draw: "1",
    start: "0",
    length: "10",
    "search[value]": "",
    "search[regex]": "false",
    "order[0][column]": "5",
    "order[0][dir]": "asc",
  };

  const columns = [
    "product_name",
    "ingredient.ingredient_name",
    "product_category.name",
    "product_category_id",
    "ingredient.synonym",
    "NAFDAC",
    "form.name",
    "route.name",
    "strength",
    "applicant.name",
    "approval_date",
    "status",
  ];

  columns.forEach((column, index) => {
    params[`columns[${index}][data]`] = column;
    params[`columns[${index}][name]`] = column;
    params[`columns[${index}][searchable]`] = "true";
    params[`columns[${index}][orderable]`] = index === 2 ? "false" : "true";
    params[`columns[${index}][search][value]`] = index === 5 ? identifier : "";
    params[`columns[${index}][search][regex]`] = "false";
  });

  return params;
}

async function fetchOfficialRecord(identifier: string): Promise<RegistryRecord | null> {
  const response = await axios.get<GreenbookResponse>(GREENBOOK_URL, {
    params: makeParams(identifier),
    timeout: 8_000,
    headers: {
      Accept: "application/json, text/javascript, */*; q=0.01",
      "X-Requested-With": "XMLHttpRequest",
      "User-Agent": "DrugRegistryVerifier/0.1 (public registry lookup aid)",
    },
  });

  const rows = Array.isArray(response.data?.data) ? response.data.data : [];
  const exact = rows.find(
    row => normalizeIdentifier(clean(row.NAFDAC)) === identifier,
  );
  return exact ? mapRecord(exact) : null;
}

export async function verifyIdentifier(
  rawIdentifier: string,
  details: PackageDetails = {},
): Promise<VerificationResult> {
  const normalized = normalizeIdentifier(rawIdentifier);

  if (!normalized || !isValidIdentifier(normalized)) {
    return makeBaseResult(normalized, "input_invalid");
  }

  const now = Date.now();

  // 1. Check database cache first
  try {
    const cachedRecord = await registryDb.getCachedRecord(normalized);
    if (cachedRecord) {
      // Convert DB record to RegistryRecord
      const record: RegistryRecord = {
        productName: cachedRecord.productName || "",
        activeIngredients: "",
        productCategory: cachedRecord.category || "",
        nafdacNumber: cachedRecord.identifier,
        form: cachedRecord.form || "",
        routeOfAdministration: "",
        strengths: cachedRecord.strength || "",
        applicantName: cachedRecord.applicant || "",
        approvalDate: cachedRecord.approvalDate || null,
        expiryDate: cachedRecord.expiryDate || null,
        status: cachedRecord.status || "Unknown",
      };

      const warnings = comparePackageDetails(record, details);
      const result: VerificationResult = {
        ...makeBaseResult(normalized, stateForRecord(record, warnings)),
        record,
        warnings,
        cached: true,
        cacheAgeSeconds: Math.floor((now - new Date(cachedRecord.lastVerified).getTime()) / 1000),
      };
      return result;
    }
  } catch (error) {
    console.warn("[Cache] Error reading from database:", error);
    // Continue to fetch from source if cache fails
  }

  // 2. Fetch from official Greenbook
  try {
    const record = await fetchOfficialRecord(normalized);
    
    if (record) {
      const warnings = comparePackageDetails(record, details);
      const result: VerificationResult = {
        ...makeBaseResult(normalized, stateForRecord(record, warnings)),
        record,
        warnings,
      };

      // 3. Save to database cache
      try {
        await registryDb.upsertRecord({
          identifier: normalized,
          source: "NAFDAC_Greenbook",
          productName: record.productName,
          strength: record.strengths,
          form: record.form,
          applicant: record.applicantName,
          status: record.status,
          approvalDate: record.approvalDate || undefined,
          expiryDate: record.expiryDate || undefined,
          category: record.productCategory,
          route: record.routeOfAdministration,
          rawResponse: JSON.stringify(record),
          sourceTimestamp: new Date().toISOString(),
          adapterVersion: ADAPTER_VERSION,
          ttlSeconds: record.status.toLocaleLowerCase() === "active" ? 86400 : 3600,
        });
      } catch (cacheError) {
        console.warn("[Cache] Failed to save record:", cacheError);
      }

      return result;
    }

    // No record found
    return makeBaseResult(normalized, "no_registry_match");
  } catch (error) {
    console.warn("[Greenbook] Lookup unavailable", {
      code: axios.isAxiosError(error) ? error.code : "unknown",
    });
    return makeBaseResult(normalized, "unable_to_verify");
  }
}

export function clearRegistryCache(): void {
  // We can't clear the database easily without deleting everything
  // This is now handled by TTLs in the database
  console.log("[Cache] TTL-based cache is used; clear not needed");
}

export function registryHealth(): { status: "ready"; source: string } {
  return { status: "ready", source: "NAFDAC Greenbook" };
}