"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Paystack Config ──────────────────────────────────────────────────────────
const PAYSTACK_PUBLIC_KEY = "pk_test_YOUR_PAYSTACK_KEY_HERE";

// ─── Initial Data ─────────────────────────────────────────────────────────────
const INITIAL_USERS = [
  { id: "u1", name: "Super Admin", email: "admin@ath.com", password: "admin123", role: "superadmin", balance: 500, phone: "0200000001", active: true, createdAt: "2024-01-01" },
  { id: "u2", name: "John Dealer", email: "dealer@ath.com", password: "pass123", role: "dealer", balance: 200, phone: "0244000002", active: true, createdAt: "2024-01-05" },
  { id: "u3", name: "Ama Agent", email: "agent@ath.com", password: "pass123", role: "agent", balance: 100, phone: "0554000003", active: true, createdAt: "2024-01-10" },
  { id: "u4", name: "Kofi Customer", email: "customer@ath.com", password: "pass123", role: "customer", balance: 50, phone: "0271000004", active: true, createdAt: "2024-01-15" },
];

const NETWORKS = ["MTN", "Telecel", "AirtelTigo"];

const BASE_BUNDLES = [
  { id: "b1", network: "MTN", size: "1 GB", basePrice: 4.20 },
  { id: "b2", network: "MTN", size: "2 GB", basePrice: 8.50 },
  { id: "b3", network: "MTN", size: "3 GB", basePrice: 13.00 },
  { id: "b4", network: "MTN", size: "4 GB", basePrice: 17.50 },
  { id: "b5", network: "MTN", size: "5 GB", basePrice: 21.00 },
  { id: "b6", network: "MTN", size: "10 GB", basePrice: 41.00 },
  { id: "b7", network: "MTN", size: "20 GB", basePrice: 79.50 },
  { id: "b8", network: "MTN", size: "50 GB", basePrice: 193.50 },
  { id: "b9", network: "Telecel", size: "1 GB", basePrice: 4.00 },
  { id: "b10", network: "Telecel", size: "2 GB", basePrice: 8.00 },
  { id: "b11", network: "Telecel", size: "5 GB", basePrice: 19.00 },
  { id: "b12", network: "Telecel", size: "10 GB", basePrice: 38.00 },
  { id: "b13", network: "Telecel", size: "20 GB", basePrice: 75.00 },
  { id: "b14", network: "Telecel", size: "50 GB", basePrice: 180.00 },
  { id: "b15", network: "AirtelTigo", size: "1 GB", basePrice: 3.80 },
  { id: "b16", network: "AirtelTigo", size: "2 GB", basePrice: 7.50 },
  { id: "b17", network: "AirtelTigo", size: "5 GB", basePrice: 18.00 },
  { id: "b18", network: "AirtelTigo", size: "10 GB", basePrice: 36.00 },
  { id: "b19", network: "AirtelTigo", size: "20 GB", basePrice: 70.00 },
  { id: "b20", network: "AirtelTigo", size: "50 GB", basePrice: 170.00 },
];

// Role price multipliers (superadmin sets these)
const INITIAL_PRICE_CONFIG = {
  superadmin: 1.0,
  dealer: 1.05,
  agent: 1.10,
  customer: 1.15,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const genId = () => Math.random().toString(36).slice(2, 9);
const fmt = (n) => `¢${Number(n).toFixed(2)}`;
const fmtGHS = (n) => `GHS ${Number(n).toFixed(2)}`;

const NETWORK_COLORS = {
  MTN: { bg: "#FFC300", text: "#1a1200", light: "#FFF8DC" },
  Telecel: { bg: "#E60026", text: "#fff", light: "#FFE8EC" },
  AirtelTigo: { bg: "#E4002B", text: "#fff", light: "#FFE8EC" },
};
const NETWORK_ICONS = { MTN: "📶", Telecel: "📡", AirtelTigo: "🔴" };

const ROLE_COLORS = {
  superadmin: "#7C3AED",
  dealer: "#0891B2",
  agent: "#059669",
  customer: "#D97706",
};

// ─── Components ───────────────────────────────────────────────────────────────

function Badge({ role }) {
  return (
    <span style={{
      background: ROLE_COLORS[role] + "22",
      color: ROLE_COLORS[role],
      padding: "2px 10px",
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 600,
      textTransform: "capitalize",
      letterSpacing: 0.3,
    }}>{role}</span>
  );
}

function StatusBadge({ status }) {
  const colors = {
    completed: ["#D1FAE5", "#065F46"],
    pending: ["#FEF9C3", "#854D0E"],
    failed: ["#FEE2E2", "#991B1B"],
  };
  const [bg, tx] = colors[status] || colors.pending;
  return (
    <span style={{ background: bg, color: tx, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, textTransform: "capitalize" }}>
      {status}
    </span>
  );
}

function Sidebar({ user, activePage, setActivePage, onLogout }) {
  const superAdminMenu = [
    { key: "dashboard", icon: "🏠", label: "Dashboard" },
    { key: "users", icon: "👥", label: "Users" },
    { key: "pricing", icon: "💰", label: "Pricing" },
    { key: "bundles", icon: "📦", label: "Bundles" },
    { key: "orders", icon: "📋", label: "All Orders" },
    { key: "wallet", icon: "👛", label: "Wallet" },
  ];
  const dealerMenu = [
    { key: "dashboard", icon: "🏠", label: "Dashboard" },
    { key: "buy", icon: "🛒", label: "Buy Bundles" },
    { key: "orders", icon: "📋", label: "My Orders" },
    { key: "wallet", icon: "👛", label: "Wallet" },
    { key: "agents", icon: "🧑‍💼", label: "My Agents" },
  ];
  const agentMenu = [
    { key: "dashboard", icon: "🏠", label: "Dashboard" },
    { key: "buy", icon: "🛒", label: "Buy Bundles" },
    { key: "orders", icon: "📋", label: "My Orders" },
    { key: "wallet", icon: "👛", label: "Wallet" },
  ];
  const customerMenu = [
    { key: "dashboard", icon: "🏠", label: "Dashboard" },
    { key: "buy", icon: "🛒", label: "Buy Bundles" },
    { key: "orders", icon: "📋", label: "My Orders" },
    { key: "wallet", icon: "👛", label: "Wallet" },
  ];
  const menus = { superadmin: superAdminMenu, dealer: dealerMenu, agent: agentMenu, customer: customerMenu };
  const menu = menus[user.role] || customerMenu;

  return (
    <div style={{
      width: 220, minHeight: "100vh", background: "linear-gradient(160deg,#1e0a3c 0%,#2d1b69 100%)",
      display: "flex", flexDirection: "column", padding: "0 0 20px",
      position: "fixed", top: 0, left: 0, zIndex: 100,
    }}>
      <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: "50%",
            background: "linear-gradient(135deg,#a78bfa,#7c3aed)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 700, color: "#fff",
          }}>{user.name[0]}</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{user.name}</div>
            <Badge role={user.role} />
          </div>
        </div>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>{user.email}</div>
      </div>

      <nav style={{ flex: 1, padding: "12px 0" }}>
        {menu.map(item => (
          <button key={item.key} onClick={() => setActivePage(item.key)} style={{
            display: "flex", alignItems: "center", gap: 12, width: "100%",
            padding: "11px 20px", border: "none", cursor: "pointer", textAlign: "left",
            background: activePage === item.key ? "rgba(124,58,237,0.35)" : "transparent",
            color: activePage === item.key ? "#c4b5fd" : "rgba(255,255,255,0.65)",
            fontWeight: activePage === item.key ? 600 : 400,
            fontSize: 14, borderLeft: activePage === item.key ? "3px solid #a78bfa" : "3px solid transparent",
            transition: "all 0.15s",
          }}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div style={{ padding: "0 16px" }}>
        <div style={{
          background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 14px",
          marginBottom: 12, border: "1px solid rgba(255,255,255,0.1)",
        }}>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginBottom: 2 }}>Wallet Balance</div>
          <div style={{ color: "#4ade80", fontWeight: 700, fontSize: 16 }}>{fmtGHS(user.balance)}</div>
        </div>
        <button onClick={onLogout} style={{
          width: "100%", padding: "9px 0", borderRadius: 8,
          background: "rgba(239,68,68,0.15)", color: "#fca5a5",
          border: "1px solid rgba(239,68,68,0.25)", cursor: "pointer", fontSize: 13, fontWeight: 600,
        }}>🚪 Sign Out</button>
      </div>
    </div>
  );
}

function TopBar({ title, user }) {
  return (
    <div style={{
      position: "fixed", top: 0, left: 220, right: 0, height: 60, zIndex: 90,
      background: "#fff", borderBottom: "1px solid #f0f0f0",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 28px",
    }}>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1a1a2e" }}>{title}</h2>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#6b7280", fontSize: 13 }}>
        <span>Welcome, <strong>{user.name.split(" ")[0]}</strong></span>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div style={{
      background: color || "#fff", borderRadius: 14, padding: "18px 20px",
      border: "1px solid #e5e7eb", minWidth: 0, flex: 1,
    }}>
      <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: "#1a1a2e" }}>{value}</div>
    </div>
  );
}

// ─── Pages ────────────────────────────────────────────────────────────────────

function DashboardPage({ user, orders, allUsers }) {
  const myOrders = user.role === "superadmin" ? orders : orders.filter(o => o.userId === user.id);
  const total = myOrders.length;
  const pending = myOrders.filter(o => o.status === "pending").length;
  const completed = myOrders.filter(o => o.status === "completed").length;
  const spent = myOrders.filter(o => o.status === "completed").reduce((s, o) => s + o.price, 0);

  return (
    <div>
      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard label="Wallet Balance" value={fmtGHS(user.balance)} icon="💰" color="#EDE9FE" />
        <StatCard label="Total Orders" value={total} icon="📦" color="#E0F2FE" />
        <StatCard label="Pending" value={pending} icon="⏳" color="#FFF7ED" />
        <StatCard label="Completed" value={completed} icon="✅" color="#ECFDF5" />
      </div>

      {user.role === "superadmin" && (
        <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
          <StatCard label="Total Users" value={allUsers.length} icon="👥" color="#F3E8FF" />
          <StatCard label="Total Revenue" value={fmt(spent)} icon="📈" color="#FEF3C7" />
          <StatCard label="Dealers" value={allUsers.filter(u => u.role === "dealer").length} icon="🏪" color="#ECFDF5" />
          <StatCard label="Agents" value={allUsers.filter(u => u.role === "agent").length} icon="🧑‍💼" color="#E0F2FE" />
        </div>
      )}

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: 20 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#1a1a2e" }}>Recent Orders</h3>
        {myOrders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "#9ca3af" }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
            No orders yet
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #f3f4f6" }}>
                {["Order ID", "Phone", "Network", "Bundle", "Amount", "Status", "Date"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 10px", color: "#6b7280", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {myOrders.slice(-5).reverse().map(o => (
                <tr key={o.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "10px 10px", fontFamily: "monospace", color: "#7c3aed", fontSize: 12 }}>#{o.id}</td>
                  <td style={{ padding: "10px 10px" }}>{o.phone}</td>
                  <td style={{ padding: "10px 10px" }}>
                    <span style={{
                      background: NETWORK_COLORS[o.network]?.bg || "#eee",
                      color: NETWORK_COLORS[o.network]?.text || "#333",
                      padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                    }}>{o.network}</span>
                  </td>
                  <td style={{ padding: "10px 10px", fontWeight: 600 }}>{o.bundle}</td>
                  <td style={{ padding: "10px 10px", fontWeight: 700, color: "#059669" }}>{fmt(o.price)}</td>
                  <td style={{ padding: "10px 10px" }}><StatusBadge status={o.status} /></td>
                  <td style={{ padding: "10px 10px", color: "#6b7280" }}>{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function BuyBundlesPage({ user, setUser, priceConfig, onOrder, bundles }) {
  const [activeNetwork, setActiveNetwork] = useState("MTN");
  const [phone, setPhone] = useState("");
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [msg, setMsg] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const networkBundles = bundles.filter(b => b.network === activeNetwork);
  const multiplier = priceConfig[user.role] || 1.15;
  const getPrice = (base) => (base * multiplier).toFixed(2);

  const handleBuy = () => {
    if (!phone || phone.length < 10) { setMsg({ type: "error", text: "Enter a valid phone number." }); return; }
    if (!selectedBundle) { setMsg({ type: "error", text: "Select a bundle." }); return; }
    const price = parseFloat(getPrice(selectedBundle.basePrice));
    if (user.balance < price) { setMsg({ type: "error", text: "Insufficient wallet balance. Please top up." }); return; }
    setConfirming(true);
  };

  const confirmOrder = () => {
    const price = parseFloat(getPrice(selectedBundle.basePrice));
    const order = {
      id: genId(), userId: user.id, userName: user.name,
      phone, network: selectedBundle.network, bundle: selectedBundle.size,
      price, status: "completed", date: new Date().toLocaleDateString(),
    };
    onOrder(order, price);
    setMsg({ type: "success", text: `✅ ${selectedBundle.size} bundle sent to ${phone}!` });
    setConfirming(false);
    setPhone("");
    setSelectedBundle(null);
  };

  return (
    <div>
      {msg && (
        <div style={{
          background: msg.type === "success" ? "#ECFDF5" : "#FEE2E2",
          border: `1px solid ${msg.type === "success" ? "#6EE7B7" : "#FCA5A5"}`,
          color: msg.type === "success" ? "#065F46" : "#991B1B",
          padding: "12px 16px", borderRadius: 10, marginBottom: 16,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          {msg.text}
          <button onClick={() => setMsg(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>×</button>
        </div>
      )}

      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "14px 20px", flex: 1 }}>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>Wallet Balance</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#7c3aed" }}>{fmtGHS(user.balance)}</div>
        </div>
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "14px 20px", flex: 2 }}>
          <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>Recipient Phone Number</div>
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 0244123456"
            style={{
              width: "100%", padding: "8px 12px", border: "1px solid #d1d5db",
              borderRadius: 8, fontSize: 15, boxSizing: "border-box",
            }} />
        </div>
      </div>

      {/* Network Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "#f3f4f6", padding: 4, borderRadius: 10 }}>
        {NETWORKS.map(n => (
          <button key={n} onClick={() => { setActiveNetwork(n); setSelectedBundle(null); }} style={{
            flex: 1, padding: "10px 0", border: "none", cursor: "pointer",
            borderRadius: 8, fontWeight: 600, fontSize: 13, transition: "all 0.15s",
            background: activeNetwork === n ? NETWORK_COLORS[n]?.bg : "transparent",
            color: activeNetwork === n ? NETWORK_COLORS[n]?.text : "#6b7280",
          }}>{n}</button>
        ))}
      </div>

      {/* Bundle Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px,1fr))", gap: 12, marginBottom: 20 }}>
        {networkBundles.map(b => {
          const price = getPrice(b.basePrice);
          const selected = selectedBundle?.id === b.id;
          return (
            <div key={b.id} onClick={() => setSelectedBundle(b)} style={{
              borderRadius: 12, cursor: "pointer", overflow: "hidden",
              border: selected ? "2px solid #7c3aed" : "2px solid transparent",
              boxShadow: selected ? "0 0 0 4px rgba(124,58,237,0.15)" : "none",
              transition: "all 0.15s",
            }}>
              <div style={{ background: NETWORK_COLORS[b.network]?.bg, padding: "12px 14px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: NETWORK_COLORS[b.network]?.text, opacity: 0.7 }}>{b.network}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: NETWORK_COLORS[b.network]?.text }}>{b.size}</div>
              </div>
              <div style={{ background: "#1a1a2e", padding: "8px 14px" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Price</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>¢{price}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>No Expiry</div>
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={handleBuy} disabled={!selectedBundle || !phone} style={{
        width: "100%", padding: "14px 0", borderRadius: 12,
        background: selectedBundle && phone ? "linear-gradient(135deg,#7c3aed,#5b21b6)" : "#e5e7eb",
        color: selectedBundle && phone ? "#fff" : "#9ca3af",
        border: "none", cursor: selectedBundle && phone ? "pointer" : "not-allowed",
        fontSize: 16, fontWeight: 700,
      }}>
        {selectedBundle ? `Buy ${selectedBundle.size} for ¢${getPrice(selectedBundle.basePrice)}` : "Select a Bundle"}
      </button>

      {/* Confirm Modal */}
      {confirming && selectedBundle && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
        }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 28, maxWidth: 380, width: "90%" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 700 }}>Confirm Purchase</h3>
            <div style={{ background: "#f9fafb", borderRadius: 10, padding: 16, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "#6b7280" }}>Network</span><strong>{selectedBundle.network}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "#6b7280" }}>Bundle</span><strong>{selectedBundle.size}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "#6b7280" }}>Phone</span><strong>{phone}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e5e7eb", paddingTop: 8 }}>
                <span style={{ color: "#6b7280" }}>Total</span>
                <strong style={{ color: "#7c3aed", fontSize: 18 }}>¢{getPrice(selectedBundle.basePrice)}</strong>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirming(false)} style={{
                flex: 1, padding: 12, border: "1px solid #e5e7eb", borderRadius: 10,
                background: "#fff", cursor: "pointer", fontWeight: 600,
              }}>Cancel</button>
              <button onClick={confirmOrder} style={{
                flex: 1, padding: 12, border: "none", borderRadius: 10,
                background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff",
                cursor: "pointer", fontWeight: 700,
              }}>Confirm & Buy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WalletPage({ user, setUser, transactions, onTopup }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePaystack = () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 1) return;
    setLoading(true);
    // Load Paystack inline script
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = () => {
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: Math.round(amt * 100),
        currency: "GHS",
        ref: "ATH_" + genId(),
        metadata: { userId: user.id },
        callback: (response) => {
          onTopup(amt, response.reference);
          setAmount("");
          setLoading(false);
        },
        onClose: () => setLoading(false),
      });
      handler.openIframe();
    };
    document.body.appendChild(script);
  };

  const myTx = transactions.filter(t => t.userId === user.id);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)", borderRadius: 16, padding: "20px 22px", color: "#fff" }}>
          <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 4 }}>Total Balance</div>
          <div style={{ fontSize: 32, fontWeight: 800 }}>{fmtGHS(user.balance)}</div>
          <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>{user.email}</div>
        </div>
        <div style={{ background: "#fff", borderRadius: 16, padding: "20px 22px", border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 10, fontWeight: 600 }}>Top Up via Paystack</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={amount} onChange={e => setAmount(e.target.value)} type="number" min="1" placeholder="Amount (GHS)"
              style={{ flex: 1, padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14 }} />
            <button onClick={handlePaystack} disabled={loading || !amount} style={{
              padding: "8px 16px", background: "#0a9b5a", color: "#fff",
              border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13,
            }}>{loading ? "..." : "Pay"}</button>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            {[10, 20, 50, 100].map(q => (
              <button key={q} onClick={() => setAmount(String(q))} style={{
                padding: "4px 10px", background: "#f3f4f6", border: "1px solid #e5e7eb",
                borderRadius: 6, fontSize: 12, cursor: "pointer", fontWeight: 600,
              }}>GHS {q}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: 20 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>Transaction History</h3>
        {myTx.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "#9ca3af" }}>No transactions yet</div>
        ) : (
          myTx.slice().reverse().map(t => (
            <div key={t.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 0", borderBottom: "1px solid #f3f4f6",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: t.type === "topup" ? "#ECFDF5" : "#FEF3C7",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                }}>{t.type === "topup" ? "⬆️" : "📦"}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{t.description}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>{t.date} · {t.ref}</div>
                </div>
              </div>
              <div style={{ fontWeight: 700, color: t.type === "topup" ? "#059669" : "#DC2626", fontSize: 15 }}>
                {t.type === "topup" ? "+" : "-"}{fmtGHS(t.amount)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function OrdersPage({ user, orders }) {
  const [filterNetwork, setFilterNetwork] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const myOrders = user.role === "superadmin" ? orders : orders.filter(o => o.userId === user.id);
  const filtered = myOrders.filter(o =>
    (filterNetwork === "All" || o.network === filterNetwork) &&
    (filterStatus === "All" || o.status === filterStatus)
  );

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <select value={filterNetwork} onChange={e => setFilterNetwork(e.target.value)}
          style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }}>
          <option value="All">All Networks</option>
          {NETWORKS.map(n => <option key={n}>{n}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }}>
          {["All", "completed", "pending", "failed"].map(s => <option key={s}>{s}</option>)}
        </select>
        <span style={{ marginLeft: "auto", color: "#6b7280", fontSize: 13, alignSelf: "center" }}>
          {filtered.length} order{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af" }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>📭</div>
            No orders found
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["Order ID", ...(user.role === "superadmin" ? ["User"] : []), "Phone", "Network", "Bundle", "Amount", "Status", "Date"].map(h => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "left", color: "#6b7280", fontWeight: 600, borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice().reverse().map(o => (
                <tr key={o.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "12px 14px", fontFamily: "monospace", color: "#7c3aed", fontSize: 12 }}>#{o.id}</td>
                  {user.role === "superadmin" && <td style={{ padding: "12px 14px" }}>{o.userName}</td>}
                  <td style={{ padding: "12px 14px" }}>{o.phone}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ background: NETWORK_COLORS[o.network]?.bg, color: NETWORK_COLORS[o.network]?.text, padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{o.network}</span>
                  </td>
                  <td style={{ padding: "12px 14px", fontWeight: 600 }}>{o.bundle}</td>
                  <td style={{ padding: "12px 14px", fontWeight: 700, color: "#059669" }}>{fmt(o.price)}</td>
                  <td style={{ padding: "12px 14px" }}><StatusBadge status={o.status} /></td>
                  <td style={{ padding: "12px 14px", color: "#6b7280" }}>{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function UsersPage({ users, setUsers }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer", phone: "" });
  const [msg, setMsg] = useState(null);

  const addUser = () => {
    if (!form.name || !form.email || !form.password) { setMsg("Fill all fields"); return; }
    const newUser = { id: genId(), ...form, balance: 0, active: true, createdAt: new Date().toLocaleDateString() };
    setUsers(prev => [...prev, newUser]);
    setForm({ name: "", email: "", password: "", role: "customer", phone: "" });
    setShowAdd(false);
    setMsg(null);
  };

  const toggleActive = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, active: !u.active } : u));
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ color: "#6b7280", fontSize: 14 }}>{users.length} total users</span>
        <button onClick={() => setShowAdd(true)} style={{
          padding: "9px 18px", background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
          color: "#fff", border: "none", borderRadius: 9, fontWeight: 700, cursor: "pointer",
        }}>+ Add User</button>
      </div>

      {showAdd && (
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: 20, marginBottom: 16 }}>
          <h4 style={{ margin: "0 0 14px", fontWeight: 700 }}>New User</h4>
          {msg && <div style={{ color: "#DC2626", fontSize: 13, marginBottom: 10 }}>{msg}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[["Full Name", "name", "text"], ["Email", "email", "email"], ["Password", "password", "password"], ["Phone", "phone", "text"]].map(([label, key, type]) => (
              <div key={key}>
                <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, boxSizing: "border-box" }} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>Role</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, boxSizing: "border-box" }}>
                {["customer", "agent", "dealer"].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button onClick={() => setShowAdd(false)} style={{ padding: "9px 20px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
            <button onClick={addUser} style={{ padding: "9px 20px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>Create User</button>
          </div>
        </div>
      )}

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Name", "Email", "Phone", "Role", "Balance", "Status", "Action"].map(h => (
                <th key={h} style={{ padding: "12px 14px", textAlign: "left", color: "#6b7280", fontWeight: 600, borderBottom: "1px solid #e5e7eb" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: "1px solid #f3f4f6", opacity: u.active ? 1 : 0.5 }}>
                <td style={{ padding: "12px 14px", fontWeight: 600 }}>{u.name}</td>
                <td style={{ padding: "12px 14px", color: "#6b7280" }}>{u.email}</td>
                <td style={{ padding: "12px 14px" }}>{u.phone}</td>
                <td style={{ padding: "12px 14px" }}><Badge role={u.role} /></td>
                <td style={{ padding: "12px 14px", fontWeight: 700, color: "#059669" }}>{fmtGHS(u.balance)}</td>
                <td style={{ padding: "12px 14px" }}>
                  <span style={{ background: u.active ? "#ECFDF5" : "#FEE2E2", color: u.active ? "#065F46" : "#991B1B", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                    {u.active ? "Active" : "Suspended"}
                  </span>
                </td>
                <td style={{ padding: "12px 14px" }}>
                  {u.role !== "superadmin" && (
                    <button onClick={() => toggleActive(u.id)} style={{
                      padding: "4px 10px", border: "1px solid #e5e7eb", borderRadius: 6,
                      background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600,
                      color: u.active ? "#DC2626" : "#059669",
                    }}>{u.active ? "Suspend" : "Activate"}</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PricingPage({ priceConfig, setPriceConfig }) {
  const [config, setConfig] = useState({ ...priceConfig });
  const [saved, setSaved] = useState(false);

  const save = () => {
    setPriceConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <p style={{ color: "#6b7280", marginBottom: 20, fontSize: 14 }}>
        Set price multipliers for each role. Prices are calculated as: Base Price × Multiplier.
      </p>
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: 24, maxWidth: 480 }}>
        {["dealer", "agent", "customer"].map(role => (
          <div key={role} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Badge role={role} />
                <span style={{ fontSize: 13, color: "#6b7280" }}>Markup</span>
              </div>
              <strong style={{ fontSize: 15 }}>{((config[role] - 1) * 100).toFixed(0)}% above base</strong>
            </div>
            <input type="range" min="1.00" max="1.50" step="0.01" value={config[role]}
              onChange={e => setConfig(c => ({ ...c, [role]: parseFloat(e.target.value) }))}
              style={{ width: "100%" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9ca3af" }}>
              <span>0% markup</span><span>50% markup</span>
            </div>

            <div style={{ marginTop: 10, background: "#f9fafb", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>
              <span style={{ color: "#6b7280" }}>Example: 5 GB MTN → </span>
              <strong style={{ color: "#7c3aed" }}>¢{(21.00 * config[role]).toFixed(2)}</strong>
              <span style={{ color: "#9ca3af" }}> (base ¢21.00)</span>
            </div>
          </div>
        ))}

        <button onClick={save} style={{
          marginTop: 8, padding: "11px 28px", background: saved ? "#059669" : "linear-gradient(135deg,#7c3aed,#5b21b6)",
          color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 14,
        }}>{saved ? "✓ Saved!" : "Save Pricing"}</button>
      </div>
    </div>
  );
}

function BundlesPage({ bundles, setBundles }) {
  const EMPTY_FORM = { network: "MTN", size: "", basePrice: "" };
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [msg, setMsg] = useState(null);

  const flash = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 2500);
  };

  const addBundle = () => {
    if (!addForm.size.trim()) { flash("Size is required.", "error"); return; }
    const price = parseFloat(addForm.basePrice);
    if (!price || price <= 0) { flash("Enter a valid base price.", "error"); return; }
    const newBundle = {
      id: genId(),
      network: addForm.network,
      size: addForm.size.trim(),
      basePrice: price,
    };
    setBundles(prev => [...prev, newBundle]);
    setAddForm(EMPTY_FORM);
    setShowAdd(false);
    flash("Bundle added successfully.");
  };

  const startEdit = (b) => {
    setEditId(b.id);
    setEditForm({ network: b.network, size: b.size, basePrice: String(b.basePrice) });
  };

  const saveEdit = () => {
    if (!editForm.size.trim()) { flash("Size is required.", "error"); return; }
    const price = parseFloat(editForm.basePrice);
    if (!price || price <= 0) { flash("Enter a valid base price.", "error"); return; }
    setBundles(prev => prev.map(b =>
      b.id === editId
        ? { ...b, network: editForm.network, size: editForm.size.trim(), basePrice: price }
        : b
    ));
    setEditId(null);
    flash("Bundle updated.");
  };

  const deleteBundle = (id) => {
    setBundles(prev => prev.filter(b => b.id !== id));
    flash("Bundle deleted.");
  };

  const inputStyle = {
    padding: "7px 10px", border: "1px solid #d1d5db", borderRadius: 7,
    fontSize: 13, boxSizing: "border-box",
  };
  const btnStyle = (variant) => ({
    padding: "6px 13px", borderRadius: 7, cursor: "pointer",
    fontWeight: 600, fontSize: 12, border: "none",
    ...(variant === "primary" ? { background: "#7c3aed", color: "#fff" } :
        variant === "danger"  ? { background: "#FEE2E2", color: "#991B1B" } :
                                { background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb" }),
  });

  return (
    <div>
      {msg && (
        <div style={{
          background: msg.type === "success" ? "#ECFDF5" : "#FEE2E2",
          border: `1px solid ${msg.type === "success" ? "#6EE7B7" : "#FCA5A5"}`,
          color: msg.type === "success" ? "#065F46" : "#991B1B",
          padding: "10px 16px", borderRadius: 10, marginBottom: 16, fontSize: 13,
        }}>{msg.text}</div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ color: "#6b7280", fontSize: 14 }}>{bundles.length} bundles across {NETWORKS.length} networks</span>
        <button onClick={() => { setShowAdd(true); setEditId(null); }} style={{
          padding: "9px 18px", background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
          color: "#fff", border: "none", borderRadius: 9, fontWeight: 700, cursor: "pointer",
        }}>+ Add Bundle</button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: 20, marginBottom: 20 }}>
          <h4 style={{ margin: "0 0 14px", fontWeight: 700, fontSize: 15 }}>New Bundle</h4>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div>
              <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>Network</label>
              <select value={addForm.network} onChange={e => setAddForm(f => ({ ...f, network: e.target.value }))}
                style={{ ...inputStyle, minWidth: 120 }}>
                {NETWORKS.map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>Size (e.g. 5 GB)</label>
              <input value={addForm.size} onChange={e => setAddForm(f => ({ ...f, size: e.target.value }))}
                placeholder="5 GB" style={{ ...inputStyle, width: 120 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>Base Price (¢)</label>
              <input type="number" min="0.01" step="0.01" value={addForm.basePrice}
                onChange={e => setAddForm(f => ({ ...f, basePrice: e.target.value }))}
                placeholder="21.00" style={{ ...inputStyle, width: 110 }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={addBundle} style={btnStyle("primary")}>Add</button>
              <button onClick={() => { setShowAdd(false); setAddForm(EMPTY_FORM); }} style={btnStyle("neutral")}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Bundles grouped by network */}
      {NETWORKS.map(network => {
        const netBundles = bundles.filter(b => b.network === network);
        return (
          <div key={network} style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", marginBottom: 16, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px", borderBottom: "1px solid #f3f4f6" }}>
              <div style={{ background: NETWORK_COLORS[network]?.bg, color: NETWORK_COLORS[network]?.text, padding: "4px 14px", borderRadius: 20, fontWeight: 700, fontSize: 14 }}>{network}</div>
              <span style={{ color: "#9ca3af", fontSize: 13 }}>{netBundles.length} bundle{netBundles.length !== 1 ? "s" : ""}</span>
            </div>

            {netBundles.length === 0 ? (
              <div style={{ padding: "20px", color: "#9ca3af", fontSize: 13 }}>No bundles for this network yet.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    {["Size", "Base Price", "Actions"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: "#6b7280", fontWeight: 600, borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {netBundles.map(b => (
                    <tr key={b.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      {editId === b.id ? (
                        <>
                          <td style={{ padding: "10px 16px" }}>
                            <input value={editForm.size} onChange={e => setEditForm(f => ({ ...f, size: e.target.value }))}
                              style={{ ...inputStyle, width: 110 }} />
                          </td>
                          <td style={{ padding: "10px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <span style={{ color: "#6b7280" }}>¢</span>
                              <input type="number" min="0.01" step="0.01" value={editForm.basePrice}
                                onChange={e => setEditForm(f => ({ ...f, basePrice: e.target.value }))}
                                style={{ ...inputStyle, width: 90 }} />
                            </div>
                          </td>
                          <td style={{ padding: "10px 16px" }}>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={saveEdit} style={btnStyle("primary")}>Save</button>
                              <button onClick={() => setEditId(null)} style={btnStyle("neutral")}>Cancel</button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={{ padding: "10px 16px", fontWeight: 700, fontSize: 15, color: "#1a1a2e" }}>{b.size}</td>
                          <td style={{ padding: "10px 16px", fontWeight: 600, color: "#7c3aed" }}>¢{b.basePrice.toFixed(2)}</td>
                          <td style={{ padding: "10px 16px" }}>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={() => startEdit(b)} style={btnStyle("neutral")}>Edit</button>
                              <button onClick={() => deleteBundle(b.id)} style={btnStyle("danger")}>Delete</button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Auth Pages ───────────────────────────────────────────────────────────────

function LoginPage({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    const result = onLogin(email, password);
    if (!result) setError("Invalid email or password.");
  };

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(160deg,#1e0a3c 0%,#2d1b69 60%,#1e3a5f 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ width: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg,#a78bfa,#7c3aed)",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px",
            fontSize: 30,
          }}>📶</div>
          <h1 style={{ color: "#fff", margin: "0 0 6px", fontSize: 26, fontWeight: 800 }}>Achievers Tech Hub</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", margin: 0, fontSize: 14 }}>Data Bundle Top-Up System</p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 20, padding: 28, backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h2 style={{ color: "#fff", margin: "0 0 20px", fontSize: 20, fontWeight: 700 }}>Sign In</h2>
          {error && <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}

          <div style={{ marginBottom: 14 }}>
            <label style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, display: "block", marginBottom: 6 }}>Email Address</label>
            <input value={email} onChange={e => { setEmail(e.target.value); setError(""); }} type="email" placeholder="you@email.com"
              onKeyDown={e => e.key === "Enter" && submit()}
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 14, boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, display: "block", marginBottom: 6 }}>Password</label>
            <input value={password} onChange={e => { setPassword(e.target.value); setError(""); }} type="password" placeholder="••••••••"
              onKeyDown={e => e.key === "Enter" && submit()}
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 14, boxSizing: "border-box" }} />
          </div>

          <button onClick={submit} style={{
            width: "100%", padding: 13, background: "linear-gradient(135deg,#a78bfa,#7c3aed)",
            color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: "pointer",
          }}>Sign In</button>

          <p style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: 16, fontSize: 13 }}>
            Don't have an account?{" "}
            <button onClick={onSwitchToRegister} style={{ background: "none", border: "none", color: "#a78bfa", cursor: "pointer", fontWeight: 600, fontSize: 13, padding: 0 }}>
              Create Account
            </button>
          </p>
        </div>

        <div style={{ marginTop: 20, background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "12px 16px", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, margin: "0 0 8px", fontWeight: 600 }}>DEMO ACCOUNTS</p>
          {[["admin@ath.com", "admin123", "superadmin"], ["dealer@ath.com", "pass123", "dealer"], ["agent@ath.com", "pass123", "agent"], ["customer@ath.com", "pass123", "customer"]].map(([e, p, r]) => (
            <button key={e} onClick={() => { setEmail(e); setPassword(p); }} style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6,
              color: "rgba(255,255,255,0.6)", padding: "4px 10px", margin: "2px 4px 2px 0",
              cursor: "pointer", fontSize: 11,
            }}>Use {r}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function RegisterPage({ onRegister, onSwitchToLogin }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "", role: "customer" });
  const [error, setError] = useState("");

  const submit = () => {
    if (!form.name || !form.email || !form.phone || !form.password) { setError("All fields required."); return; }
    if (form.password !== form.confirm) { setError("Passwords don't match."); return; }
    const result = onRegister(form);
    if (!result) setError("Email already exists.");
  };

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(160deg,#1e0a3c 0%,#2d1b69 60%,#1e3a5f 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ width: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📶</div>
          <h1 style={{ color: "#fff", margin: 0, fontSize: 24, fontWeight: 800 }}>Create Account</h1>
        </div>

        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 20, padding: 28, border: "1px solid rgba(255,255,255,0.1)" }}>
          {error && <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "10px 14px", borderRadius: 8, marginBottom: 14, fontSize: 13 }}>{error}</div>}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            {[["Full Name", "name", "text"], ["Email", "email", "email"], ["Phone", "phone", "tel"], ["Password", "password", "password"], ["Confirm Password", "confirm", "password"]].map(([label, key, type]) => (
              <div key={key} style={{ gridColumn: key === "name" || key === "confirm" ? "span 2" : undefined }}>
                <label style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, display: "block", marginBottom: 4 }}>{label}</label>
                <input type={type} value={form[key]} onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); setError(""); }}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 13, boxSizing: "border-box" }} />
              </div>
            ))}
            <div>
              <label style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, display: "block", marginBottom: 4 }}>Account Type</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.15)", background: "#2d1b69", color: "#fff", fontSize: 13, boxSizing: "border-box" }}>
                <option value="customer">Customer</option>
                <option value="agent">Agent</option>
                <option value="dealer">Dealer</option>
              </select>
            </div>
          </div>

          <button onClick={submit} style={{
            width: "100%", padding: 13, background: "linear-gradient(135deg,#a78bfa,#7c3aed)",
            color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 6,
          }}>Create Account</button>

          <p style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: 14, fontSize: 13 }}>
            Already have an account?{" "}
            <button onClick={onSwitchToLogin} style={{ background: "none", border: "none", color: "#a78bfa", cursor: "pointer", fontWeight: 600, fontSize: 13, padding: 0 }}>Sign In</button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [authPage, setAuthPage] = useState("login"); // login | register
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [bundles, setBundles] = useState(BASE_BUNDLES);
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [priceConfig, setPriceConfig] = useState(INITIAL_PRICE_CONFIG);
  const [activePage, setActivePage] = useState("dashboard");

  const handleLogin = (email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user && user.active) { setCurrentUser(user); setActivePage("dashboard"); return true; }
    return false;
  };

  const handleRegister = (form) => {
    if (users.find(u => u.email === form.email)) return false;
    const newUser = { id: genId(), name: form.name, email: form.email, password: form.password, role: form.role, phone: form.phone, balance: 0, active: true, createdAt: new Date().toLocaleDateString() };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setActivePage("dashboard");
    return true;
  };

  const handleOrder = (order, price) => {
    setOrders(prev => [...prev, order]);
    const updatedUser = { ...currentUser, balance: parseFloat((currentUser.balance - price).toFixed(2)) };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    setTransactions(prev => [...prev, {
      id: genId(), userId: currentUser.id, type: "purchase",
      amount: price, description: `${order.network} ${order.bundle} → ${order.phone}`,
      date: new Date().toLocaleDateString(), ref: order.id,
    }]);
  };

  const handleTopup = (amount, ref) => {
    const updatedUser = { ...currentUser, balance: parseFloat((currentUser.balance + amount).toFixed(2)) };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    setTransactions(prev => [...prev, {
      id: genId(), userId: currentUser.id, type: "topup",
      amount, description: `Wallet Top-Up via Paystack`,
      date: new Date().toLocaleDateString(), ref,
    }]);
  };

  const handleLogout = () => { setCurrentUser(null); setAuthPage("login"); };

  // Sync user balance changes from users array
  useEffect(() => {
    if (currentUser) {
      const fresh = users.find(u => u.id === currentUser.id);
      if (fresh && fresh.balance !== currentUser.balance) setCurrentUser(fresh);
    }
  }, [users]);

  if (!currentUser) {
    if (authPage === "register") return <RegisterPage onRegister={handleRegister} onSwitchToLogin={() => setAuthPage("login")} />;
    return <LoginPage onLogin={handleLogin} onSwitchToRegister={() => setAuthPage("register")} />;
  }

  const PAGE_TITLES = {
    dashboard: "Dashboard", buy: "Buy Bundles", orders: "Orders",
    wallet: "Wallet", users: "User Management", pricing: "Pricing Config",
    bundles: "Bundle Catalog", agents: "My Agents",
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <DashboardPage user={currentUser} orders={orders} allUsers={users} />;
      case "buy": return <BuyBundlesPage user={currentUser} setUser={setCurrentUser} priceConfig={priceConfig} onOrder={handleOrder} bundles={bundles} />;
      case "orders": return <OrdersPage user={currentUser} orders={orders} />;
      case "wallet": return <WalletPage user={currentUser} setUser={setCurrentUser} transactions={transactions} onTopup={handleTopup} />;
      case "users": return currentUser.role === "superadmin" ? <UsersPage users={users} setUsers={setUsers} /> : null;
      case "pricing": return currentUser.role === "superadmin" ? <PricingPage priceConfig={priceConfig} setPriceConfig={setPriceConfig} /> : null;
      case "bundles": return currentUser.role === "superadmin" ? <BundlesPage bundles={bundles} setBundles={setBundles} /> : null;
      case "agents": return <OrdersPage user={currentUser} orders={orders} />;
      default: return <DashboardPage user={currentUser} orders={orders} allUsers={users} />;
    }
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#f5f5f7", minHeight: "100vh" }}>
      <Sidebar user={currentUser} activePage={activePage} setActivePage={setActivePage} onLogout={handleLogout} />
      <TopBar title={PAGE_TITLES[activePage] || "Dashboard"} user={currentUser} />
      <main style={{ marginLeft: 220, paddingTop: 60 }}>
        <div style={{ padding: 28 }}>{renderPage()}</div>
      </main>
    </div>
  );
}
