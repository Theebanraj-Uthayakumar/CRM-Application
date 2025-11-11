import { useEffect, useMemo, useState } from "react";

import { ConfirmationDialog } from "./components/ConfirmationDialog";
import { CustomerForm } from "./components/CustomerForm";
import { CustomerTable } from "./components/CustomerTable";
import { Modal } from "./components/Modal";
import { useCustomerMutations } from "./hooks/useCustomerMutations";
import { useCustomers } from "./hooks/useCustomers";
import type { Customer, CustomerFormData, CustomerPayload } from "./types/customer";

export const App = () => {
  const { data, isLoading, isError, error, refetch, isFetching } = useCustomers();
  const { createMutation, updateMutation, deleteMutation } = useCustomerMutations();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isError && error) {
      setFeedbackMessage(error.message);
    }
  }, [error, isError]);

  const customers = useMemo(() => data ?? [], [data]);

  const normalizeOptionalField = (value: string | null | undefined, previous?: string | null): string | null | undefined => {
    const trimmed = value?.trim();
    if (trimmed) {
      return trimmed;
    }

    if (previous !== undefined) {
      return previous ? null : previous;
    }

    return undefined;
  };

  const normalizePayload = (values: CustomerFormData, previous?: Customer | null): CustomerPayload => ({
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    phoneNumber: normalizeOptionalField(values.phoneNumber, previous?.phoneNumber ?? undefined),
    address: normalizeOptionalField(values.address, previous?.address ?? undefined),
    city: normalizeOptionalField(values.city, previous?.city ?? undefined),
    state: normalizeOptionalField(values.state, previous?.state ?? undefined),
    country: normalizeOptionalField(values.country, previous?.country ?? undefined),
  });

  const toFormData = (customer: Customer): CustomerFormData => ({
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    phoneNumber: customer.phoneNumber ?? undefined,
    address: customer.address ?? undefined,
    city: customer.city ?? undefined,
    state: customer.state ?? undefined,
    country: customer.country ?? undefined,
  });

  const handleCreateClick = () => {
    setCustomerToEdit(null);
    setIsFormOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setCustomerToEdit(customer);
    setIsFormOpen(true);
  };

  const handleDelete = (customer: Customer) => {
    setCustomerToDelete(customer);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setCustomerToEdit(null);
  };

  const handleFormSubmit = async (values: CustomerFormData) => {
    const payload = normalizePayload(values, customerToEdit);
    try {
      if (customerToEdit) {
        await updateMutation.mutateAsync({ id: customerToEdit.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setFeedbackMessage(null);
      closeForm();
    } catch (mutationError) {
      setFeedbackMessage(mutationError instanceof Error ? mutationError.message : "Something went wrong");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;
    try {
      await deleteMutation.mutateAsync(customerToDelete.id);
      setFeedbackMessage(null);
      setCustomerToDelete(null);
    } catch (mutationError) {
      setFeedbackMessage(mutationError instanceof Error ? mutationError.message : "Unable to delete customer");
    }
  };

  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <div>
          <h1>Customer Accounts</h1>
          <p>Manage customer records with ease.</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button type="button" className="button button--secondary" onClick={() => refetch()} disabled={isFetching}>
            Refresh
          </button>
          <button type="button" className="button button--primary" onClick={handleCreateClick}>
            Add Customer
          </button>
        </div>
      </header>

      {feedbackMessage ? <div className="status-banner status-banner--error">{feedbackMessage}</div> : null}

      {isLoading ? (
        <p className="status-banner status-banner--info">Loading customers...</p>
      ) : (
        <CustomerTable customers={customers} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      <Modal
        open={isFormOpen}
        title={customerToEdit ? "Edit Customer" : "Add Customer"}
        onClose={closeForm}
      >
        <CustomerForm
          initialValues={customerToEdit ? toFormData(customerToEdit) : undefined}
          onSubmit={handleFormSubmit}
          onCancel={closeForm}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      <ConfirmationDialog
        open={Boolean(customerToDelete)}
        title="Delete customer"
        description={`Are you sure you want to delete ${customerToDelete?.firstName ?? "this"} customer? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setCustomerToDelete(null)}
        isProcessing={deleteMutation.isPending}
      />
    </div>
  );
};
