import { useEffect, useRef } from 'react';

/** Folha modal que sobe de baixo (usa <dialog> nativo). */
export default function Sheet({ open, onClose, title, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const dlg = ref.current;
    if (open && !dlg.open) dlg.showModal();
    if (!open && dlg.open) dlg.close();
  }, [open]);

  // Fecha ao tocar no fundo escurecido, fora da folha.
  const handleClick = (e) => {
    const r = ref.current.getBoundingClientRect();
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
