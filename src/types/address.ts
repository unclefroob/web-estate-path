export interface AddressSuggestion {
  display_name: string;
  place_id: number;
  lat: string;
  lon: string;
  address: {
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

export interface AddressSearchResponse {
  success: boolean;
  suggestions: AddressSuggestion[];
  message?: string;
}
