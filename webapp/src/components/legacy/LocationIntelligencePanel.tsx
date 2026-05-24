/**
 * ============================================================================
 * File: webapp/src/components/legacy/LocationIntelligencePanel.tsx
 * Purpose:
 *   Legacy location intelligence panel migrated from the old dashboard asset
 *   folder. Kept here as an optional reference component for future UI reuse.
 * ============================================================================
 */

import { useEffect, useState } from "react";

const locationApiBase = import.meta.env.VITE_LOCATION_API ?? "http://localhost:4010";

interface Country {
  iso2: string;
  name: string;
}

interface Region {
  code: string;
  name: string;
}

interface AreaCodeEntry {
  city: string;
}

interface IpLookupResult {
  city: string;
  country: string;
  isp: string;
}

interface CapturedGps {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

interface FusedLocation {
  city?: string;
  region?: string;
  country?: string;
  source: string;
  confidence: number;
  latitude: number;
  longitude: number;
}

interface SourceConfidence {
  source: string;
  confidence: number;
}

interface FuseResponse {
  fused: FusedLocation;
  sources: SourceConfidence[];
}

export default function LocationIntelligencePanel({
  onFused,
}: {
  onFused?: (location: FusedLocation) => void;
}) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [areaCodes, setAreaCodes] = useState<Record<string, AreaCodeEntry>>({});
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [areaCode, setAreaCode] = useState("");
  const [ip, setIp] = useState("");
  const [ipResult, setIpResult] = useState<IpLookupResult | null>(null);
  const [gps, setGps] = useState<CapturedGps | null>(null);
  const [fused, setFused] = useState<FusedLocation | null>(null);
  const [sources, setSources] = useState<SourceConfidence[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${locationApiBase}/api/location/countries`)
      .then((response) => response.json() as Promise<Country[]>)
      .then(setCountries)
      .catch(() => setError("Unable to load country list."));
  }, []);

  useEffect(() => {
    if (!country) {
      setRegions([]);
      setAreaCodes({});
      return;
    }

    Promise.all([
      fetch(`${locationApiBase}/api/location/regions/${country}`).then(
        (response) => response.json() as Promise<Region[]>,
      ),
      fetch(`${locationApiBase}/api/location/area-codes/${country}`).then(
        (response) => response.json() as Promise<Record<string, AreaCodeEntry>>,
      ),
    ])
      .then(([nextRegions, nextAreaCodes]) => {
        setRegions(nextRegions);
        setAreaCodes(nextAreaCodes);
      })
      .catch(() => setError("Unable to load region and area-code data."));
  }, [country]);

  function captureGps() {
    if (!navigator.geolocation) {
      setError("Geolocation is not available in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
      setGps({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date(position.timestamp).toISOString(),
      });
      setError(null);
    });
  }

  async function lookupIp() {
    if (!ip) {
      return;
    }

    try {
      const response = await fetch(`${locationApiBase}/api/location/ip/${ip}`);
      setIpResult((await response.json()) as IpLookupResult);
      setError(null);
    } catch {
      setError("Unable to resolve IP address.");
    }
  }

  async function fuseLocation() {
    try {
      const response = await fetch(`${locationApiBase}/api/location/fuse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gps,
          ip: ipResult,
          userSelected: { country, region, areaCode },
        }),
      });
      const payload = (await response.json()) as FuseResponse;
      setFused(payload.fused);
      setSources(payload.sources);
      setError(null);
      onFused?.(payload.fused);
    } catch {
      setError("Unable to fuse location signals.");
    }
  }

  return (
    <article className="panel location-intelligence-panel">
      <header className="panel-header">
        <h3>Location Intelligence</h3>
      </header>

      <div className="location-panel-form">
        <label>
          Country
          <select value={country} onChange={(event) => setCountry(event.target.value)}>
            <option value="">Select...</option>
            {countries.map((entry) => (
              <option key={entry.iso2} value={entry.iso2}>
                {entry.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Region
          <select value={region} onChange={(event) => setRegion(event.target.value)}>
            <option value="">Select...</option>
            {regions.map((entry) => (
              <option key={entry.code} value={entry.code}>
                {entry.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Area Code
          <select value={areaCode} onChange={(event) => setAreaCode(event.target.value)}>
            <option value="">Select...</option>
            {Object.entries(areaCodes).map(([code, entry]) => (
              <option key={code} value={code}>
                {code} - {entry.city}
              </option>
            ))}
          </select>
        </label>

        <label>
          IP Address
          <div className="location-panel-inline">
            <input
              value={ip}
              onChange={(event) => setIp(event.target.value)}
              placeholder="IPv4 or IPv6"
            />
            <button type="button" onClick={lookupIp}>
              Lookup IP
            </button>
          </div>
        </label>

        <div className="location-panel-actions">
          <button type="button" onClick={captureGps}>
            Capture GPS
          </button>
          <button type="button" className="primary-action" onClick={fuseLocation}>
            Fuse Location
          </button>
        </div>

        {ipResult ? (
          <p className="location-panel-meta">
            IP result: {ipResult.city}, {ipResult.country} - {ipResult.isp}
          </p>
        ) : null}

        {gps ? (
          <p className="location-panel-meta">
            GPS: {gps.latitude.toFixed(4)}, {gps.longitude.toFixed(4)} (+/-{gps.accuracy.toFixed(0)}m)
          </p>
        ) : null}

        {error ? <p className="location-panel-error">{error}</p> : null}

        {fused ? (
          <section className="location-panel-result">
            <h4>Unified Location</h4>
            <p>
              <strong>{fused.city ?? fused.region ?? fused.country}</strong>
              <br />
              Source: {fused.source} · Confidence: {(fused.confidence * 100).toFixed(0)}%
              <br />
              {fused.latitude}, {fused.longitude}
            </p>
            <ul>
              {sources.map((source) => (
                <li key={source.source}>
                  {source.source}: {(source.confidence * 100).toFixed(0)}%
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </article>
  );
}