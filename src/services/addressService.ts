import { api } from "./api";
import type { AddressSearchResponse } from "../types/address";

export const addressService = {
  async searchAddresses(query: string): Promise<AddressSearchResponse> {
    return api.get<AddressSearchResponse>(
      `/address/search?query=${encodeURIComponent(query)}`
    );
  },
};
