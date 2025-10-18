import { api } from "./api";
import type {
  CreatePropertyRequest,
  PropertyResponse,
} from "../types/property";

export const propertyService = {
  async createProperty(
    data: CreatePropertyRequest,
    accessToken: string
  ): Promise<PropertyResponse> {
    return api.post<PropertyResponse>("/properties", data, accessToken);
  },

  async getUserProperties(accessToken: string): Promise<PropertyResponse> {
    return api.get<PropertyResponse>("/properties", accessToken);
  },

  async getPropertyById(
    id: string,
    accessToken: string
  ): Promise<PropertyResponse> {
    return api.get<PropertyResponse>(`/properties/${id}`, accessToken);
  },

  async deleteProperty(
    id: string,
    accessToken: string
  ): Promise<PropertyResponse> {
    return api.delete<PropertyResponse>(`/properties/${id}`, accessToken);
  },
};
