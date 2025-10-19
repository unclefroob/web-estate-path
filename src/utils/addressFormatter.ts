import type { Property } from "../types/property";

/**
 * Format address according to Australian standards
 * Format: [Unit/]Number Street, Suburb STATE Postcode
 * Example: 14 Toward St, Murumbeena VIC 3163
 * Example with unit: 12/45 Smith St, Melbourne VIC 3000
 */
export const formatAustralianAddress = (property: Property): string => {
  const parts: string[] = [];

  // Unit/Number Street (abbreviate street type)
  const streetPart = property.unit
    ? `${property.unit}/${property.number} ${abbreviateStreetType(
        property.street
      )}`
    : `${property.number} ${abbreviateStreetType(property.street)}`;
  parts.push(streetPart);

  // Suburb STATE Postcode
  parts.push(`${property.suburb} ${property.state} ${property.postcode}`);

  return parts.join(", ");
};

/**
 * Abbreviate common Australian street types
 * Converts full street type names to their standard abbreviations
 */
export const abbreviateStreetType = (street: string): string => {
  const abbreviations: Record<string, string> = {
    Street: "St",
    Road: "Rd",
    Avenue: "Ave",
    Drive: "Dr",
    Court: "Ct",
    Place: "Pl",
    Lane: "Ln",
    Crescent: "Cres",
    Terrace: "Tce",
    Boulevard: "Blvd",
    Highway: "Hwy",
    Circuit: "Cct",
    Parade: "Pde",
    Grove: "Gr",
    Close: "Cl",
  };

  let result = street;
  for (const [full, abbrev] of Object.entries(abbreviations)) {
    result = result.replace(new RegExp(`\\b${full}\\b`, "gi"), abbrev);
  }
  return result;
};
