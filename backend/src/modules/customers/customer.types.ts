export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null | undefined;
  address?: string | null | undefined;
  city?: string | null | undefined;
  state?: string | null | undefined;
  country?: string | null | undefined;
  createdAt: Date;
}

export interface CreateCustomerInput {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null | undefined;
  address?: string | null | undefined;
  city?: string | null | undefined;
  state?: string | null | undefined;
  country?: string | null | undefined;
}

export interface UpdateCustomerInput {
  firstName?: string | undefined;
  lastName?: string | undefined;
  email?: string | undefined;
  phoneNumber?: string | null | undefined;
  address?: string | null | undefined;
  city?: string | null | undefined;
  state?: string | null | undefined;
  country?: string | null | undefined;
}
