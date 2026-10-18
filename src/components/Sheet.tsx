import { useEffect, useRef } from 'react';
import type { MouseEvent, ReactNode } from 'react';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/** Folha modal que sobe de baixo (usa <dialog> nativo). */
export default function Sheet({ open, onClose, title, children }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (open && !dlg.open) dlg.showModal();
    if (!open && dlg.open) dlg.close();
  }, [open]);

  // Fecha ao tocar no fundo escurecido, fora da folha.
  const handleClick = (e: MouseEvent<HTMLDialogElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    if (e.clientY < r.top || e.clientY > r.bottom || e.clientX < r.left || e.clientX > r.right) onClose();
  };

  return (
    <dialog ref={ref} className="sheet" onClose={onClose} onClick={handleClick} aria-label={title}>
      <button className="close" onClick={onClose} aria-label="Fechar">✕</button>
      <h2>{title}</h2>
      {open && children}
    </dialog>
  );
}
