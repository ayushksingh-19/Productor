import { useEffect, useState } from "react";
import {
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useOutletContext,
} from "react-router-dom";
import ProductCard from "./components/ProductCard";
import ProductModal from "./components/ProductModal";
import ToastStack from "./components/ToastStack";
import api, { toMediaUrl } from "./lib/api";
import { formatCount, initialsFromName } from "./lib/formatters";

function getSavedSession() {
  try {
    const stored = localStorage.getItem("orufy-session");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function getAuthStepLabel(step, identifier, errorMessage) {
  if (step === "success") {
    return "OTP Entered";
  }

  if (step === "otp" && errorMessage) {
    return "Error";
  }

  if (step === "otp") {
    return "Enter OTP";
  }

  return identifier.trim() ? "Enter Credentials" : "Login";
}

function matchesSearch(product, searchValue) {
  const search = searchValue.trim().toLowerCase();

  if (!search) {
    return true;
  }

  const text = `${product.name} ${product.brandName} ${product.type}`.toLowerCase();
  return text.includes(search);
}

export default function App() {
  const [session, setSession] = useState(getSavedSession);

  useEffect(() => {
    if (!session) {
      localStorage.removeItem("orufy-session");
      return;
    }

    localStorage.setItem("orufy-session", JSON.stringify(session));
  }, [session]);

  return (
    <Routes>
      <Route
        path="/auth"
        element={
          session ? (
            <Navigate replace to="/home" />
          ) : (
            <AuthPage onAuthenticated={setSession} />
          )
        }
      />

      <Route
        element={
          session ? (
            <DashboardLayout onLogout={() => setSession(null)} session={session} />
          ) : (
            <Navigate replace to="/auth" />
          )
        }
      >
        <Route path="/home" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
      </Route>

      <Route
        path="*"
        element={<Navigate replace to={session ? "/home" : "/auth"} />}
      />
    </Routes>
  );
}

function AuthPage({ onAuthenticated }) {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [step, setStep] = useState("credentials");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [demoOtp, setDemoOtp] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stepLabel = getAuthStepLabel(step, identifier, errorMessage);

  async function requestOtp(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const { data } = await api.post("/auth/request-otp", { identifier });
      setDemoOtp(data.demoOtp);
      setOtpDigits(["", "", "", "", "", ""]);
      setStep("otp");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to request OTP.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function verifyOtp(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const { data } = await api.post("/auth/verify-otp", {
        identifier,
        otp: otpDigits.join(""),
      });

      setStep("success");

      window.setTimeout(() => {
        onAuthenticated(data.user);
        navigate("/home", { replace: true });
      }, 700);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to verify OTP.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resendOtp() {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const { data } = await api.post("/auth/request-otp", { identifier });
      setDemoOtp(data.demoOtp);
      setOtpDigits(["", "", "", "", "", ""]);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to resend OTP.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function changeOtpDigit(index, value) {
    const cleanValue = value.replace(/\D/g, "").slice(-1);
    const nextDigits = [...otpDigits];
    nextDigits[index] = cleanValue;
    setOtpDigits(nextDigits);
  }

  return (
    <main className="auth-shell">
      <section className="auth-board">
        <aside className="auth-visual">
          <div className="auth-visual__brand">
            <span className="auth-visual__brand-mark" />
            <strong>Productr</strong>
          </div>

          <div className="auth-visual__art">
            <div className="auth-showcase">
              <img
                alt="Featured product preview"
                src={toMediaUrl("/media-assets/brownie-walnut.svg")}
              />
            </div>
          </div>
        </aside>

        <section className="auth-panel">
          <div className="auth-panel__state">{stepLabel}</div>

          {step === "otp" || step === "success" ? (
            <form className="auth-form" onSubmit={verifyOtp}>
              <h1>Login to your Productr Account</h1>

              <label className="auth-field">
                <span>Enter OTP</span>
                <div className="otp-row">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      maxLength={1}
                      value={digit}
                      disabled={step === "success"}
                      onChange={(event) => changeOtpDigit(index, event.target.value)}
                    />
                  ))}
                </div>
              </label>

              {errorMessage ? (
                <p className="field-error field-error--otp">{errorMessage}</p>
              ) : null}

              <button
                className="primary-button"
                type="submit"
                disabled={isSubmitting || step === "success"}
              >
                {step === "success"
                  ? "Verified"
                  : isSubmitting
                    ? "Verifying..."
                    : "Enter your OTP"}
              </button>

              <p className="otp-helper">
                Didn't receive OTP?
                <button type="button" onClick={resendOtp}>
                  Resend
                </button>
              </p>

              <p className="demo-helper">
                Demo OTP: {demoOtp || "Request a code to begin"}
              </p>
            </form>
          ) : (
            <form className="auth-form" onSubmit={requestOtp}>
              <h1>Login to your Productr Account</h1>

              <label className="auth-field">
                <span>Email or Phone number</span>
                <input
                  type="text"
                  value={identifier}
                  placeholder="Enter email or phone number"
                  onChange={(event) => setIdentifier(event.target.value)}
                />
              </label>

              {errorMessage ? <p className="field-error">{errorMessage}</p> : null}

              <button className="primary-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending OTP..." : "Login"}
              </button>
            </form>
          )}

          <button className="ghost-card" type="button">
            <span>Don't have a Productr Account</span>
            <strong>SignUp Here</strong>
          </button>
        </section>
      </section>
    </main>
  );
}

function DashboardLayout({ onLogout, session }) {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [modal, setModal] = useState({ mode: null, product: null });
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setIsLoading(true);
    setLoadError("");

    try {
      const { data } = await api.get("/products");
      setProducts(data.products);
    } catch (error) {
      setLoadError(
        error.response?.data?.message || "Unable to load products right now.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function showToast(message, tone = "success") {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, message, tone }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3200);
  }

  async function saveProduct(formData) {
    setIsSaving(true);

    try {
      const request =
        modal.mode === "edit"
          ? api.put(`/products/${modal.product.id}`, formData)
          : api.post("/products", formData);

      const { data } = await request;
      await loadProducts();
      setModal({ mode: null, product: null });
      showToast(data.message);
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to save product.", "error");
      throw error;
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteProduct(product) {
    setIsSaving(true);

    try {
      const { data } = await api.delete(`/products/${product.id}`);
      await loadProducts();
      setModal({ mode: null, product: null });
      showToast(data.message);
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to delete product.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function changeProductStatus(product, nextStatus) {
    setIsSaving(true);

    try {
      const { data } = await api.patch(`/products/${product.id}/status`, {
        status: nextStatus,
      });

      await loadProducts();
      showToast(data.message);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Unable to update product status.",
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const pageContext = {
    isLoading,
    loadError,
    onCreate: () => setModal({ mode: "create", product: null }),
    onDelete: (product) => setModal({ mode: "delete", product }),
    onEdit: (product) => setModal({ mode: "edit", product }),
    onRetryLoad: loadProducts,
    onToggleStatus: changeProductStatus,
    products,
    searchTerm,
    setSearchTerm,
  };

  return (
    <>
      <main className="dashboard-shell">
        <aside className="sidebar">
          <div className="sidebar__brand">
            <div className="sidebar__brand-mark">
              <span className="auth-visual__brand-mark" />
              <strong>Productr</strong>
            </div>
          </div>

          <div className="sidebar__search">Search</div>

          <nav className="sidebar__nav">
            <NavLink className="sidebar__link" to="/home">
              Home
            </NavLink>
            <NavLink className="sidebar__link" to="/products">
              Products
            </NavLink>
          </nav>

          <button className="sidebar__logout" type="button" onClick={onLogout}>
            Log out
          </button>
        </aside>

        <section className="workspace">
          <header className="workspace__header">
            <div className="workspace__crumb">
              {location.pathname === "/products" ? "Products" : "Home"}
            </div>

            <div className="workspace__tools">
              <label className="workspace__searchbar">
                <span className="workspace__search-icon" aria-hidden="true">
                  <SearchGlyph />
                </span>
                <input
                  value={searchTerm}
                  placeholder="Search Services, Products"
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </label>

              <div className="workspace__avatar">
                <span>{initialsFromName(session.displayName)}</span>
                <small aria-hidden="true">
                  <CaretGlyph />
                </small>
              </div>
            </div>
          </header>

          <div className="workspace__body">
            <Outlet context={pageContext} />
          </div>
        </section>
      </main>

      {modal.mode ? (
        <ProductModal
          mode={modal.mode}
          pending={isSaving}
          product={modal.product}
          onClose={() => setModal({ mode: null, product: null })}
          onConfirmDelete={deleteProduct}
          onSave={saveProduct}
        />
      ) : null}

      <ToastStack
        items={toasts}
        onDismiss={(toastId) =>
          setToasts((current) => current.filter((item) => item.id !== toastId))
        }
      />
    </>
  );
}

function HomePage() {
  const {
    isLoading,
    loadError,
    onDelete,
    onEdit,
    onRetryLoad,
    onToggleStatus,
    products,
    searchTerm,
  } = useOutletContext();
  const [activeTab, setActiveTab] = useState("published");

  const visibleProducts = products.filter((product) => {
    return product.status === activeTab && matchesSearch(product, searchTerm);
  });

  return (
    <section className="surface">
      <div className="tab-row">
        <button
          className={
            activeTab === "published"
              ? "tab-row__tab tab-row__tab--active"
              : "tab-row__tab"
          }
          type="button"
          onClick={() => setActiveTab("published")}
        >
          Published
        </button>
        <button
          className={
            activeTab === "unpublished"
              ? "tab-row__tab tab-row__tab--active"
              : "tab-row__tab"
          }
          type="button"
          onClick={() => setActiveTab("unpublished")}
        >
          Unpublished
        </button>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : loadError ? (
        <LoadErrorState message={loadError} onRetry={onRetryLoad} />
      ) : visibleProducts.length === 0 ? (
        <EmptyState
          title={
            activeTab === "published"
              ? "No Published Products"
              : "No Unpublished Products"
          }
          subtitle={
            activeTab === "published"
              ? "Your published products will appear here. Create and publish your first product to get started."
              : "Your unpublished products will appear here as drafts while you prepare them."
          }
        />
      ) : (
        <div className="product-grid">
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={onDelete}
              onEdit={onEdit}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ProductsPage() {
  const {
    isLoading,
    loadError,
    onCreate,
    onDelete,
    onEdit,
    onRetryLoad,
    onToggleStatus,
    products,
    searchTerm,
  } = useOutletContext();

  const visibleProducts = products.filter((product) =>
    matchesSearch(product, searchTerm),
  );

  return (
    <section className="surface">
      <div className="surface__topbar">
        <h2>Products</h2>
        <button className="link-button" type="button" onClick={onCreate}>
          + Add Products
        </button>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : loadError ? (
        <LoadErrorState message={loadError} onRetry={onRetryLoad} />
      ) : visibleProducts.length === 0 ? (
        <EmptyState
          title="Feels a little empty over here..."
          subtitle="You can create products without connecting stores, and keep them unpublished until they are ready."
          actionLabel="Add your Products"
          onAction={onCreate}
        />
      ) : (
        <>
          <div className="product-count">{formatCount(visibleProducts.length)} products</div>

          <div className="product-grid">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onDelete={onDelete}
                onEdit={onEdit}
                onToggleStatus={onToggleStatus}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function EmptyState({ title, subtitle, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <span />
        <span />
        <span />
        <span className="empty-state__plus">+</span>
      </div>

      <h3>{title}</h3>
      <p>{subtitle}</p>

      {actionLabel ? (
        <button
          className="primary-button primary-button--small"
          type="button"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="loading-state">
      <div className="loading-state__spinner" />
      <p>Loading products...</p>
    </div>
  );
}

function LoadErrorState({ message, onRetry }) {
  return (
    <div className="empty-state">
      <h3>We couldn't load your products</h3>
      <p>{message}</p>
      <button className="primary-button primary-button--small" type="button" onClick={onRetry}>
        Try Again
      </button>
    </div>
  );
}

function SearchGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10.5 10.5L13.5 13.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CaretGlyph() {
  return (
    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
      <path
        d="M2 3L6 7L10 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
