import { toMediaUrl } from "../lib/api";
import { formatCount, formatCurrency } from "../lib/formatters";

export default function ProductCard({
  product,
  onDelete,
  onEdit,
  onToggleStatus,
}) {
  const isPublished = product.status === "published";
  const statusButtonClass = isPublished
    ? "action-button action-button--lime"
    : "action-button action-button--primary";

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
          <button
            className={statusButtonClass}
            type="button"
            onClick={() =>
              onToggleStatus(product, isPublished ? "unpublished" : "published")
            }
          >
            {isPublished ? "Unpublish" : "Publish"}
          </button>

          <button
            className="action-button action-button--muted"
            type="button"
            onClick={() => onEdit(product)}
          >
            Edit
          </button>

          <button
            className="icon-button"
            type="button"
            aria-label={`Delete ${product.name}`}
            onClick={() => onDelete(product)}
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 4.5h6l.6 1.5H19v1.5H5V6h3.4L9 4.5Zm1.5 6v6m3-6v6M7.5 7.5l.7 10.3A1.5 1.5 0 0 0 9.7 19h4.6a1.5 1.5 0 0 0 1.5-1.2l.7-10.3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
