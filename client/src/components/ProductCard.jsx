import { clsx } from "clsx";
import { toMediaUrl } from "../lib/api";
import { formatCount, formatCurrency } from "../lib/formatters";

function StatusButton({ product, onToggleStatus }) {
  const nextStatus =
    product.status === "published" ? "unpublished" : "published";

  return (
    <button
      className={clsx("action-button", {
        "action-button--lime": product.status === "published",
        "action-button--primary": product.status !== "published",
      })}
      onClick={() => onToggleStatus(product, nextStatus)}
      type="button"
    >
      {product.status === "published" ? "Unpublish" : "Publish"}
    </button>
  );
}

export default function ProductCard({
  product,
  onDelete,
  onEdit,
  onToggleStatus,
}) {
  return (
    <article className="product-card">
      <div className="product-card__image-shell">
        <img
          alt={product.name}
          className="product-card__image"
          src={toMediaUrl(product.images?.[0])}
        />
      </div>

      <div className="product-card__body">
        <div className="product-card__title-row">
          <h3>{product.name}</h3>
          <span>{product.type}</span>
        </div>

        <dl className="product-card__facts">
          <div>
            <dt>Quantity Stock</dt>
            <dd>{formatCount(product.quantity)}</dd>
          </div>
          <div>
            <dt>MRP</dt>
            <dd>{formatCurrency(product.mrp)}</dd>
          </div>
          <div>
            <dt>Selling Price</dt>
            <dd>{formatCurrency(product.sellingPrice)}</dd>
          </div>
          <div>
            <dt>Brand Name</dt>
            <dd>{product.brandName}</dd>
          </div>
          <div>
            <dt>Total Number of Images</dt>
            <dd>{formatCount(product.images?.length)}</dd>
          </div>
          <div>
            <dt>Exchange Eligibility</dt>
            <dd>{product.isExchangeable ? "YES" : "NO"}</dd>
          </div>
        </dl>

        <div className="product-card__actions">
          <StatusButton product={product} onToggleStatus={onToggleStatus} />
          <button
            className="action-button action-button--muted"
            onClick={() => onEdit(product)}
            type="button"
          >
            Edit
          </button>
          <button
            aria-label={`Delete ${product.name}`}
            className="icon-button"
            onClick={() => onDelete(product)}
            type="button"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </article>
  );
}

function TrashIcon() {
  return (
    <svg fill="none" height="16" viewBox="0 0 24 24" width="16">
      <path
        d="M9 4.5h6l.6 1.5H19v1.5H5V6h3.4L9 4.5Zm1.5 6v6m3-6v6M7.5 7.5l.7 10.3A1.5 1.5 0 0 0 9.7 19h4.6a1.5 1.5 0 0 0 1.5-1.2l.7-10.3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
