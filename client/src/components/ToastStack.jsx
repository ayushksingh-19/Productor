export default function ToastStack({ items, onDismiss }) {
  return (
    <div className="toast-stack" aria-live="polite">
      {items.map((item) => (
        <div className={`toast toast--${item.tone}`} key={item.id}>
          <span className="toast__dot" />
          <span>{item.message}</span>
          <button
            aria-label="Dismiss notification"
            className="toast__dismiss"
            onClick={() => onDismiss(item.id)}
            type="button"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
