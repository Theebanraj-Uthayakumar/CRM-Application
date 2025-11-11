import type { ReactNode } from "react";
import { useEffect } from "react";
import ReactDOM from "react-dom";

import "../styles/modal.css";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

const modalRootId = "modal-root";

export const Modal = ({ open, title, onClose, children, footer }: ModalProps) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) {
    return null;
  }

  let container = document.getElementById(modalRootId);
  if (!container) {
    container = document.createElement("div");
    container.setAttribute("id", modalRootId);
    document.body.appendChild(container);
  }

  const content = (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <header className="modal__header">
          <h2>{title}</h2>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
            X
          </button>
        </header>
        <div className="modal__content">{children}</div>
        {footer ? <footer className="modal__footer">{footer}</footer> : null}
      </div>
    </div>
  );

  return ReactDOM.createPortal(content, container);
};
