import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

import type { CustomerFormData } from "../types/customer";

const customerFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("A valid email is required"),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
});

type CustomerFormErrors = Partial<Record<keyof CustomerFormData, string>>;

interface CustomerFormProps {
  initialValues?: CustomerFormData;
  onSubmit: (values: CustomerFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const emptyForm: CustomerFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  address: "",
  city: "",
  state: "",
  country: "",
};

export const CustomerForm = ({ initialValues, onSubmit, onCancel, isSubmitting = false }: CustomerFormProps) => {
  const startingValues = useMemo(() => ({ ...emptyForm, ...initialValues }), [initialValues]);
  const [values, setValues] = useState<CustomerFormData>(startingValues);
  const [errors, setErrors] = useState<CustomerFormErrors>({});

  useEffect(() => {
    setValues(startingValues);
  }, [startingValues]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = customerFormSchema.safeParse(values);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors(
        Object.fromEntries(
          Object.entries(fieldErrors).map(([key, value]) => [key, value?.[0] ?? "Invalid value"]),
        ) as CustomerFormErrors,
      );
      return;
    }

    setErrors({});
    onSubmit(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <div className="form-field">
        <label htmlFor="firstName">First name *</label>
        <input id="firstName" name="firstName" value={values.firstName} onChange={handleChange} required />
        {errors.firstName ? <span className="form-error">{errors.firstName}</span> : null}
      </div>
      <div className="form-field">
        <label htmlFor="lastName">Last name *</label>
        <input id="lastName" name="lastName" value={values.lastName} onChange={handleChange} required />
        {errors.lastName ? <span className="form-error">{errors.lastName}</span> : null}
      </div>
      <div className="form-field">
        <label htmlFor="email">Email *</label>
        <input id="email" name="email" type="email" value={values.email} onChange={handleChange} required />
        {errors.email ? <span className="form-error">{errors.email}</span> : null}
      </div>
      <div className="form-field">
        <label htmlFor="phoneNumber">Phone number</label>
        <input id="phoneNumber" name="phoneNumber" value={values.phoneNumber ?? ""} onChange={handleChange} />
      </div>
      <div className="form-field">
        <label htmlFor="address">Address</label>
        <input id="address" name="address" value={values.address ?? ""} onChange={handleChange} />
      </div>
      <div className="form-field">
        <label htmlFor="city">City</label>
        <input id="city" name="city" value={values.city ?? ""} onChange={handleChange} />
      </div>
      <div className="form-field">
        <label htmlFor="state">State</label>
        <input id="state" name="state" value={values.state ?? ""} onChange={handleChange} />
      </div>
      <div className="form-field">
        <label htmlFor="country">Country</label>
        <input id="country" name="country" value={values.country ?? ""} onChange={handleChange} />
      </div>
      <div className="form-field" style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
        <button type="button" className="button button--secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" className="button button--primary" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
};
