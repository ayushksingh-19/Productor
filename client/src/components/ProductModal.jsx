import { useEffect, useState } from "react";
import { toMediaUrl } from "../lib/api";

const productTypes = ["Foods", "Electronics", "Clothes", "Beauty Products", "Others"];

function buildFormState(product) {
  return {
    name: product?.name || "",
    type: product?.type || "",
    quantity: product?.quantity || "",
    mrp: product?.mrp || "",
    sellingPrice: product?.sellingPrice || "",
    brandName: product?.brandName || "",
    images: product?.images || [],
    isExchangeable: product?.isExchangeable ?? true,
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
  const isDeleteModal = mode === "delete";
  const [form, setForm] = useState(buildFormState(product));
  const [newFiles, setNewFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setForm(buildFormState(product));
    setNewFiles([]);
    setErrorMessage("");
  }, [product, mode]);

  useEffect(() => {
    const urls = newFiles.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    setFilePreviews(urls);

    return () => {
      urls.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [newFiles]);

  function updateField(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleFileChange(event) {
    const files = Array.from(event.target.files || []);
    setNewFiles(files);
  }

  async function submitForm(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      setErrorMessage("Please enter product name.");
      return;
    }

    const payload = new FormData();
    payload.append("name", form.name);
    payload.append("type", form.type);
    payload.append("quantity", form.quantity);
    payload.append("mrp", form.mrp);
    payload.append("sellingPrice", form.sellingPrice);
    payload.append("brandName", form.brandName);
    payload.append("isExchangeable", String(form.isExchangeable));
    payload.append("existingImages", JSON.stringify(form.images));

    for (const file of newFiles) {
      payload.append("images", file);
    }

    setErrorMessage("");
    await onSave(payload);
  }

  const modalTitle =
    mode === "edit" ? "Edit Product" : mode === "delete" ? "Delete Product" : "Add Product";

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className={isDeleteModal ? "modal-card modal-card--compact" : "modal-card"}
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-card__header">
          <h3>{modalTitle}</h3>
          <button className="modal-card__close" type="button" onClick={onClose}>
            ×
          </button>
        </div>

        {isDeleteModal ? (
          <div className="delete-block">
            <p>
              Are you sure you want to delete this Product
              <strong> "{product?.name}"</strong>?
            </p>

            <div className="delete-block__actions">
              <button
                className="action-button action-button--muted"
                type="button"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="action-button action-button--primary"
                type="button"
                disabled={pending}
                onClick={() => onConfirmDelete(product)}
              >
                {pending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        ) : (
          <form className="product-form" onSubmit={submitForm}>
            <FormField label="Product Name">
              <input
                value={form.name}
                placeholder="CakeZone Walnut Brownie"
                className={errorMessage ? "input-error" : ""}
                onChange={(event) => updateField("name", event.target.value)}
              />
              {errorMessage ? <p className="field-error">{errorMessage}</p> : null}
            </FormField>

            <FormField label="Product Type">
              <select
                value={form.type}
                onChange={(event) => updateField("type", event.target.value)}
              >
                <option value="">Select product type</option>
                {productTypes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Quantity Stock">
              <input
                type="number"
                min="0"
                value={form.quantity}
                placeholder="Total numbers of Stock available"
                onChange={(event) => updateField("quantity", event.target.value)}
              />
            </FormField>

            <FormField label="MRP">
              <input
                type="number"
                min="0"
                value={form.mrp}
                placeholder="Total numbers of Stock available"
                onChange={(event) => updateField("mrp", event.target.value)}
              />
            </FormField>

            <FormField label="Selling Price">
              <input
                type="number"
                min="0"
                value={form.sellingPrice}
                placeholder="Total numbers of Stock available"
                onChange={(event) => updateField("sellingPrice", event.target.value)}
              />
            </FormField>

            <FormField label="Brand Name">
              <input
                value={form.brandName}
                placeholder="Total numbers of Stock available"
                onChange={(event) => updateField("brandName", event.target.value)}
              />
            </FormField>

            <FormField label="Upload Product Images">
              <label className="upload-box">
                <input
                  hidden
                  multiple
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <span>Enter Description</span>
                <strong>Browse</strong>
              </label>

              {form.images.length > 0 || filePreviews.length > 0 ? (
                <div className="upload-preview">
                  {form.images.map((imagePath) => (
                    <img key={imagePath} alt="" src={toMediaUrl(imagePath)} />
                  ))}
                  {filePreviews.map((image) => (
                    <img key={image.name} alt="" src={image.url} />
                  ))}
                </div>
              ) : null}
            </FormField>

            <FormField label="Exchange or return eligibility">
              <select
                value={String(form.isExchangeable)}
                onChange={(event) =>
                  updateField("isExchangeable", event.target.value === "true")
                }
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </FormField>

            <div className="product-form__footer">
              <button
                className="action-button action-button--primary"
                type="submit"
                disabled={pending}
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

function FormField({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
