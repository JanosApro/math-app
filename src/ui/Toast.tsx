/**
 * Small transient messages. Mount <ToastHost /> once (App does it), then call showToast('…')
 * from anywhere.
 */
import { useEffect, useState } from 'react';
import './Toast.css';

type Listener = (text: string) => void;
const listeners = new Set<Listener>();

export function showToast(text: string): void {
  for (const l of listeners) l(text);
}

export function ToastHost() {
  const [items, setItems] = useState<{ id: number; text: string }[]>([]);
  useEffect(() => {
    let n = 0;
    const l: Listener = (text) => {
      const id = ++n;
      setItems((xs) => [...xs.slice(-2), { id, text }]);
      setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 3200);
    };
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return (
    <div className="toast-host" role="status" aria-live="polite">
      {items.map((x) => (
        <div key={x.id} className="toast anim-slide-up">
          {x.text}
        </div>
      ))}
    </div>
  );
}
