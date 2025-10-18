export interface Property {
  _id: string;
  userId: string;
  unit?: string;
  number: string;
  street: string;
  suburb: string;
  state: string;
  postcode: string;
  fullAddress: string;
  coordinates?: {
    lat: string;
    lon: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePropertyRequest {
  unit?: string;
  number: string;
  street: string;
  suburb: string;
  state: string;
  postcode: string;
  fullAddress: string;
  coordinates?: {
    lat: string;
    lon: string;
  };
}

export interface PropertyResponse {
  success: boolean;
  message?: string;
  data?: {
    property?: Property;
    properties?: Property[];
    count?: number;
  };
}
