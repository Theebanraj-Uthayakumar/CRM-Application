import type { ReactNode } from "react";

import { Modal } from "./Modal";

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export const ConfirmationDialog = ({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isProcessing = false,
}: ConfirmationDialogProps) => (
  <Modal
    open={open}
    title={title}
    onClose={onCancel}
    footer={
      <div className="dialog-footer">
        <button type="button" className="button button--secondary" onClick={onCancel} disabled={isProcessing}>
          {cancelLabel}
        </button>
        <button type="button" className="button button--danger" onClick={onConfirm} disabled={isProcessing}>
          {isProcessing ? "Deleting..." : confirmLabel}
        </button>
      </div>
    }
  >
    <p>{description}</p>
  </Modal>
);
