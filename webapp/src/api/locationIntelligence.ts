export interface Country {
  iso2: string;
  iso3: string;
  name: string;
  dialCode: string;
}

export interface Region {
  code: string;
  name: string;
}

export interface IpLocation {
  ip: string;
  country: string | null;
  region: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  asn: string | null;
  isp: string | null;
}

export interface FusedLocation {
  source: string;
  confidence: number;
  country: string | null;
  region: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  timestamp: string;
}

export async function getCountries(): Promise<Country[]> {
  const res = await fetch("/api/location/countries");
  if (!res.ok) throw new Error("Failed to load countries");
  return res.json();
}

export async function getRegions(country: string): Promise<Region[]> {
  const res = await fetch(`/api/location/regions/${country}`);
  if (!res.ok) throw new Error("Failed to load regions");
  return res.json();
}

export async function getAreaCodes(country: string): Promise<Record<string, { city: string; region: string; lat: number; lon: number }>> {
  const res = await fetch(`/api/location/area-codes/${country}`);
  if (!res.ok) throw new Error("Failed to load area codes");
  return res.json();
}

export async function lookupIp(ip: string): Promise<IpLocation> {
  const res = await fetch(`/api/location/ip/${ip}`);
  if (!res.ok) throw new Error("Failed to lookup IP");
  return res.json();
}

export async function fuseLocation(input: unknown): Promise<{
  fused: FusedLocation | null;
  sources: Array<{ source: string; confidence: number; data: unknown }>;
}> {
  const res = await fetch("/api/location/fuse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to fuse location");
  return res.json();
}

export async function logLocationEvent(input: unknown) {
  const res = await fetch("/api/location/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to log ATP location event");
  return res.json();
}
