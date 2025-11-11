import type { Customer } from "../types/customer";

interface CustomerTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export const CustomerTable = ({ customers, onEdit, onDelete }: CustomerTableProps) => {
  if (customers.length === 0) {
    return <p className="status-banner status-banner--info">No customers yet. Add your first customer to get started.</p>;
  }

  return (
    <div className="table-card" role="table" aria-label="Customer table">
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Location</th>
            <th>Created</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => {
            const emailLabel = customer.email.replace(/\+/g, "");
            return (
              <tr key={customer.id}>
                <td>
                  <strong>
                    {customer.firstName} {customer.lastName}
                  </strong>
                </td>
                <td aria-label={emailLabel}>{customer.email}</td>
                <td>{customer.phoneNumber ?? "—"}</td>
                <td>
                  {[customer.city, customer.state, customer.country].filter(Boolean).join(", ") || "—"}
                </td>
                <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                <td>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button type="button" className="button button--secondary" onClick={() => onEdit(customer)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="button button--danger"
                      aria-label="Delete customer record"
                      onClick={() => onDelete(customer)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
