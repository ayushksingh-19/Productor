import { useMemo, useState } from "react";
import { clsx } from "clsx";
import { toMediaUrl } from "../lib/api";

const productTypes = ["Foods", "Electronics", "Clothes", "Beauty Products", "Others"];

function makeInitialState(product) {
  return {
    brandName: product?.brandName || "",
    images: product?.images || [],
    isExchangeable: product?.isExchangeable ?? true,
    mrp: product?.mrp || "",
    name: product?.name || "",
    quantity: product?.quantity || "",
    sellingPrice: product?.sellingPrice || "",
    type: product?.type || "",
  };
}

export default function ProductModal({
  mode,
  onClose,
  onConfirmDelete,
  onSave,
  pending,
  product,
}) {
  const isDelete = mode === "delete";
  const [formState, setFormState] = useState(() => makeInitialState(product));
  const [newFiles, setNewFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const previewItems = useMemo(
    () => [
      ...formState.images.map((imagePath) => ({
        kind: "existing",
        src: toMediaUrl(imagePath),
        value: imagePath,
      })),
      ...newFiles.map((file) => ({
        kind: "new",
        src: URL.createObjectURL(file),
        value: file.name,
      })),
    ],
    [formState.images, newFiles],
  );

  const titleMap = {
    create: "Add Product",
    delete: "Delete Product",
    edit: "Edit Product",
  };

  function updateField(name, value) {
    setFormState((current) => ({ ...current, [name]: value }));
  }

  function handleFileChange(event) {
    const files = Array.from(event.target.files || []);
    setNewFiles(files);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formState.name.trim()) {
      setErrorMessage("Please enter product name.");
      return;
    }

    const payload = new FormData();
    payload.append("name", formState.name);
    payload.append("type", formState.type);
    payload.append("quantity", formState.quantity);
    payload.append("mrp", formState.mrp);
    payload.append("sellingPrice", formState.sellingPrice);
    payload.append("brandName", formState.brandName);
    payload.append("isExchangeable", String(formState.isExchangeable));
    payload.append("existingImages", JSON.stringify(formState.images));

    newFiles.forEach((file) => {
      payload.append("images", file);
    });

    setErrorMessage("");
    await onSave(payload);
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className={clsx("modal-card", { "modal-card--compact": isDelete })}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="modal-card__header">
          <h3>{titleMap[mode]}</h3>
          <button className="modal-card__close" onClick={onClose} type="button">
            ×
          </button>
        </div>

        {isDelete ? (
          <div className="delete-block">
            <p>
              Are you sure you want to delete this Product
              <strong> “{product?.name}”</strong>?
            </p>
            <div className="delete-block__actions">
              <button
                className="action-button action-button--muted"
                onClick={onClose}
                type="button"
              >
                Cancel
              </button>
              <button
                className="action-button action-button--primary"
                disabled={pending}
                onClick={() => onConfirmDelete(product)}
                type="button"
              >
                {pending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        ) : (
          <form className="product-form" onSubmit={handleSubmit}>
            <Field label="Product Name">
              <input
                className={clsx({ "input-error": Boolean(errorMessage) })}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="CakeZone Walnut Brownie"
                value={formState.name}
              />
              {errorMessage ? <p className="field-error">{errorMessage}</p> : null}
            </Field>

            <Field label="Product Type">
              <select
                onChange={(event) => updateField("type", event.target.value)}
                value={formState.type}
              >
                <option value="">Select product type</option>
                {productTypes.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Quantity Stock">
              <input
                min="0"
                onChange={(event) => updateField("quantity", event.target.value)}
                placeholder="Total numbers of Stock available"
                type="number"
                value={formState.quantity}
              />
            </Field>

            <Field label="MRP">
              <input
                min="0"
                onChange={(event) => updateField("mrp", event.target.value)}
                placeholder="Total numbers of Stock available"
                type="number"
                value={formState.mrp}
              />
            </Field>

            <Field label="Selling Price">
              <input
                min="0"
                onChange={(event) => updateField("sellingPrice", event.target.value)}
                placeholder="Total numbers of Stock available"
                type="number"
                value={formState.sellingPrice}
              />
            </Field>

            <Field label="Brand Name">
              <input
                onChange={(event) => updateField("brandName", event.target.value)}
                placeholder="Total numbers of Stock available"
                value={formState.brandName}
              />
            </Field>

            <Field label="Upload Product Images">
              <label className="upload-box">
                <input accept="image/*" hidden multiple onChange={handleFileChange} type="file" />
                <span>Enter Description</span>
                <strong>Browse</strong>
              </label>
              {previewItems.length > 0 ? (
                <div className="upload-preview">
                  {previewItems.map((item) => (
                    <img alt="" key={`${item.kind}-${item.value}`} src={item.src} />
                  ))}
                </div>
              ) : null}
            </Field>

            <Field label="Exchange or return eligibility">
              <select
                onChange={(event) =>
                  updateField("isExchangeable", event.target.value === "true")
                }
                value={String(formState.isExchangeable)}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </Field>

            <div className="product-form__footer">
              <button
                className="action-button action-button--primary"
                disabled={pending}
                type="submit"
              >
                {pending
                  ? mode === "edit"
                    ? "Updating..."
                    : "Creating..."
                  : mode === "edit"
                    ? "Update"
                    : "Create"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ children, label }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
