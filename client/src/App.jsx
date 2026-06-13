import { useDeferredValue, useEffect, useMemo, useState } from "react";
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

function loadStoredSession() {
  try {
    const rawSession = localStorage.getItem("orufy-session");
    return rawSession ? JSON.parse(rawSession) : null;
  } catch (error) {
    return null;
  }
}

export default function App() {
  const [session, setSession] = useState(loadStoredSession);

  useEffect(() => {
    if (session) {
      localStorage.setItem("orufy-session", JSON.stringify(session));
    } else {
      localStorage.removeItem("orufy-session");
    }
  }, [session]);

  return (
    <Routes>
      <Route
        element={
          session ? (
            <Navigate replace to="/home" />
          ) : (
            <AuthPage onAuthenticated={(user) => setSession(user)} />
          )
        }
        path="/auth"
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
        <Route element={<HomePage />} path="/home" />
        <Route element={<ProductsPage />} path="/products" />
      </Route>

      <Route
        element={<Navigate replace to={session ? "/home" : "/auth"} />}
        path="*"
      />
    </Routes>
  );
}

function AuthPage({ onAuthenticated }) {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [step, setStep] = useState("credentials");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [errorMessage, setErrorMessage] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [pending, setPending] = useState(false);

  const phaseLabel = useMemo(() => {
    if (errorMessage && step === "otp") {
      return "Error";
    }

    if (step === "success") {
      return "OTP Entered";
    }

    if (step === "otp") {
      return "Enter OTP";
    }

    return identifier.trim() ? "Enter Credentials" : "Login";
  }, [errorMessage, identifier, step]);

  async function handleCredentialSubmit(event) {
    event.preventDefault();
    setPending(true);
    setErrorMessage("");

    try {
      const response = await api.post("/auth/request-otp", { identifier });
      setDemoOtp(response.data.demoOtp);
      setOtpDigits(["", "", "", "", "", ""]);
      setStep("otp");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to request OTP.");
    } finally {
      setPending(false);
    }
  }

  async function handleOtpSubmit(event) {
    event.preventDefault();
    setPending(true);
    setErrorMessage("");

    try {
      const otp = otpDigits.join("");
      const response = await api.post("/auth/verify-otp", { identifier, otp });
      setStep("success");

      window.setTimeout(() => {
        onAuthenticated(response.data.user);
        navigate("/home", { replace: true });
      }, 700);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to verify OTP.");
    } finally {
      setPending(false);
    }
  }

  async function handleResendOtp() {
    setPending(true);
    setErrorMessage("");

    try {
      const response = await api.post("/auth/request-otp", { identifier });
      setDemoOtp(response.data.demoOtp);
      setOtpDigits(["", "", "", "", "", ""]);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to resend OTP.");
    } finally {
      setPending(false);
    }
  }

  function updateOtpDigit(index, value) {
    const safeValue = value.replace(/\D/g, "").slice(-1);
    setOtpDigits((current) =>
      current.map((digit, position) => (position === index ? safeValue : digit)),
    );
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
              <img alt="Featured product preview" src={toMediaUrl("/media-assets/brownie-walnut.svg")} />
            </div>
          </div>
        </aside>

        <section className="auth-panel">
          <div className="auth-panel__state">{phaseLabel}</div>

          {step === "otp" || step === "success" ? (
            <form className="auth-form" onSubmit={handleOtpSubmit}>
              <h1>Login to your Productr Account</h1>
              <label className="auth-field">
                <span>Enter OTP</span>
                <div className="otp-row">
                  {otpDigits.map((digit, index) => (
                    <input
                      disabled={step === "success"}
                      key={index}
                      maxLength={1}
                      onChange={(event) => updateOtpDigit(index, event.target.value)}
                      value={digit}
                    />
                  ))}
                </div>
              </label>

              {errorMessage ? <p className="field-error field-error--otp">{errorMessage}</p> : null}

              <button
                className="primary-button"
                disabled={pending || step === "success"}
                type="submit"
              >
                {step === "success" ? "Verified" : pending ? "Verifying..." : "Enter your OTP"}
              </button>

              <p className="otp-helper">
                Didn't receive OTP?
                <button onClick={handleResendOtp} type="button">
                  Resend
                </button>
              </p>

              <p className="demo-helper">Demo OTP: {demoOtp || "Request a code to begin"}</p>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleCredentialSubmit}>
              <h1>Login to your Productr Account</h1>
              <label className="auth-field">
                <span>Email or Phone number</span>
                <input
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder="Enter email or phone number"
                  type="text"
                  value={identifier}
                />
              </label>

              {errorMessage ? <p className="field-error">{errorMessage}</p> : null}

              <button className="primary-button" disabled={pending} type="submit">
                {pending ? "Sending OTP..." : "Login"}
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
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalState, setModalState] = useState({ mode: null, product: null });
  const [toasts, setToasts] = useState([]);
  const deferredSearch = useDeferredValue(searchTerm);
  const location = useLocation();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (toasts.length === 0) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setToasts((current) => current.slice(1));
    }, 3200);

    return () => window.clearTimeout(timeoutId);
  }, [toasts]);

  async function fetchProducts() {
    setIsLoading(true);

    try {
      const response = await api.get("/products");
      setProducts(response.data.products);
    } finally {
      setIsLoading(false);
    }
  }

  function pushToast(message, tone = "success") {
    setToasts((current) => [
      ...current,
      { id: `${Date.now()}-${Math.random()}`, message, tone },
    ]);
  }

  async function handleSaveProduct(formData) {
    setIsMutating(true);

    try {
      const response =
        modalState.mode === "edit"
          ? await api.put(`/products/${modalState.product.id}`, formData)
          : await api.post("/products", formData);

      await fetchProducts();
      setModalState({ mode: null, product: null });
      pushToast(response.data.message);
    } catch (error) {
      pushToast(error.response?.data?.message || "Unable to save product.", "error");
      throw error;
    } finally {
      setIsMutating(false);
    }
  }

  async function handleDeleteProduct(product) {
    setIsMutating(true);

    try {
      const response = await api.delete(`/products/${product.id}`);
      await fetchProducts();
      setModalState({ mode: null, product: null });
      pushToast(response.data.message);
    } catch (error) {
      pushToast(error.response?.data?.message || "Unable to delete product.", "error");
    } finally {
      setIsMutating(false);
    }
  }

  async function handleToggleStatus(product, status) {
    setIsMutating(true);

    try {
      const response = await api.patch(`/products/${product.id}/status`, { status });
      await fetchProducts();
      pushToast(response.data.message);
    } catch (error) {
      pushToast(
        error.response?.data?.message || "Unable to update product status.",
        "error",
      );
    } finally {
      setIsMutating(false);
    }
  }

  const context = {
    deferredSearch,
    isLoading,
    onDelete: (product) => setModalState({ mode: "delete", product }),
    onEdit: (product) => setModalState({ mode: "edit", product }),
    onOpenCreate: () => setModalState({ mode: "create", product: null }),
    onToggleStatus: handleToggleStatus,
    products,
    rawSearch: searchTerm,
    setRawSearch: setSearchTerm,
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
          <button className="sidebar__logout" onClick={onLogout} type="button">
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
                <span aria-hidden="true" className="workspace__search-icon">
                  <SearchGlyph />
                </span>
                <input
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search Services, Products"
                  value={searchTerm}
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
            <Outlet context={context} />
          </div>
        </section>
      </main>

      {modalState.mode ? (
        <ProductModal
          mode={modalState.mode}
          onClose={() => setModalState({ mode: null, product: null })}
          onConfirmDelete={handleDeleteProduct}
          onSave={handleSaveProduct}
          pending={isMutating}
          product={modalState.product}
        />
      ) : null}

      <ToastStack
        items={toasts}
        onDismiss={(id) =>
          setToasts((current) => current.filter((toast) => toast.id !== id))
        }
      />
    </>
  );
}

function HomePage() {
  const { deferredSearch, isLoading, onDelete, onEdit, onToggleStatus, products } =
    useOutletContext();
  const [activeTab, setActiveTab] = useState("published");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesStatus = product.status === activeTab;
      const matchesSearch = `${product.name} ${product.brandName} ${product.type}`
        .toLowerCase()
        .includes(deferredSearch.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [activeTab, deferredSearch, products]);

  return (
    <section className="surface">
      <div className="tab-row">
        <button
          className={
            activeTab === "published"
              ? "tab-row__tab tab-row__tab--active"
              : "tab-row__tab"
          }
          onClick={() => setActiveTab("published")}
          type="button"
        >
          Published
        </button>
        <button
          className={
            activeTab === "unpublished"
              ? "tab-row__tab tab-row__tab--active"
              : "tab-row__tab"
          }
          onClick={() => setActiveTab("unpublished")}
          type="button"
        >
          Unpublished
        </button>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          subtitle={
            activeTab === "published"
              ? "Your published products will appear here. Create and publish your first product to get started."
              : "Your unpublished products will appear here as drafts while you prepare them."
          }
          title={
            activeTab === "published"
              ? "No Published Products"
              : "No Unpublished Products"
          }
        />
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              onDelete={onDelete}
              onEdit={onEdit}
              onToggleStatus={onToggleStatus}
              product={product}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ProductsPage() {
  const {
    deferredSearch,
    isLoading,
    onDelete,
    onEdit,
    onOpenCreate,
    onToggleStatus,
    products,
  } = useOutletContext();

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      `${product.name} ${product.brandName} ${product.type}`
        .toLowerCase()
        .includes(deferredSearch.toLowerCase()),
    );
  }, [deferredSearch, products]);

  return (
    <section className="surface">
      <div className="surface__topbar">
        <h2>Products</h2>
        <button className="link-button" onClick={onOpenCreate} type="button">
          + Add Products
        </button>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          actionLabel="Add your Products"
          onAction={onOpenCreate}
          subtitle="You can create products without connecting stores, and keep them unpublished until they are ready."
          title="Feels a little empty over here..."
        />
      ) : (
        <>
          <div className="product-count">{formatCount(filteredProducts.length)} products</div>
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                onDelete={onDelete}
                onEdit={onEdit}
                onToggleStatus={onToggleStatus}
                product={product}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function EmptyState({ actionLabel, onAction, subtitle, title }) {
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
          onClick={onAction}
          type="button"
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

function SearchGlyph() {
  return (
    <svg fill="none" height="14" viewBox="0 0 16 16" width="14">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10.5 10.5L13.5 13.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function CaretGlyph() {
  return (
    <svg fill="none" height="10" viewBox="0 0 12 10" width="12">
      <path
        d="M2 3L6 7L10 3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
