import { useState, useEffect } from "react";

const genId = () => Math.random().toString(36).slice(2, 9);
const fmt = (n) => `¢${Number(n).toFixed(2)}`;
const fmtGHS = (n) => `GHS ${Number(n).toFixed(2)}`;
const NETWORKS = ["MTN", "Telecel", "AirtelTigo"];
const NETWORK_COLORS = {
  MTN:        { bg: "#FFC300", text: "#1a1200" },
  Telecel:    { bg: "#E60026", text: "#fff" },
  AirtelTigo: { bg: "#E4002B", text: "#fff" },
};
const ROLE_COLORS = { superadmin:"#7C3AED", dealer:"#0891B2", agent:"#059669", customer:"#D97706" };

const INITIAL_USERS = [
  { id:"u1", name:"Super Admin",   email:"admin@ath.com",    password:"admin123", role:"superadmin", balance:500, phone:"0200000001", active:true, createdAt:"2024-01-01" },
  { id:"u2", name:"John Dealer",   email:"dealer@ath.com",   password:"pass123",  role:"dealer",     balance:200, phone:"0244000002", active:true, createdAt:"2024-01-05" },
  { id:"u3", name:"Ama Agent",     email:"agent@ath.com",    password:"pass123",  role:"agent",      balance:100, phone:"0554000003", active:true, createdAt:"2024-01-10" },
  { id:"u4", name:"Kofi Customer", email:"customer@ath.com", password:"pass123",  role:"customer",   balance:50,  phone:"0271000004", active:true, createdAt:"2024-01-15" },
];

const INITIAL_BUNDLES = [
  { id:"b1",  network:"MTN",        size:"1 GB",  basePrice:4.20,   active:true },
  { id:"b2",  network:"MTN",        size:"2 GB",  basePrice:8.50,   active:true },
  { id:"b3",  network:"MTN",        size:"3 GB",  basePrice:13.00,  active:true },
  { id:"b4",  network:"MTN",        size:"4 GB",  basePrice:17.50,  active:true },
  { id:"b5",  network:"MTN",        size:"5 GB",  basePrice:21.00,  active:true },
  { id:"b6",  network:"MTN",        size:"10 GB", basePrice:41.00,  active:true },
  { id:"b7",  network:"MTN",        size:"20 GB", basePrice:79.50,  active:true },
  { id:"b8",  network:"MTN",        size:"50 GB", basePrice:193.50, active:true },
  { id:"b9",  network:"Telecel",    size:"1 GB",  basePrice:4.00,   active:true },
  { id:"b10", network:"Telecel",    size:"2 GB",  basePrice:8.00,   active:true },
  { id:"b11", network:"Telecel",    size:"5 GB",  basePrice:19.00,  active:true },
  { id:"b12", network:"Telecel",    size:"10 GB", basePrice:38.00,  active:true },
  { id:"b13", network:"Telecel",    size:"20 GB", basePrice:75.00,  active:true },
  { id:"b14", network:"Telecel",    size:"50 GB", basePrice:180.00, active:true },
  { id:"b15", network:"AirtelTigo", size:"1 GB",  basePrice:3.80,   active:true },
  { id:"b16", network:"AirtelTigo", size:"2 GB",  basePrice:7.50,   active:true },
  { id:"b17", network:"AirtelTigo", size:"5 GB",  basePrice:18.00,  active:true },
  { id:"b18", network:"AirtelTigo", size:"10 GB", basePrice:36.00,  active:true },
  { id:"b19", network:"AirtelTigo", size:"20 GB", basePrice:70.00,  active:true },
  { id:"b20", network:"AirtelTigo", size:"50 GB", basePrice:170.00, active:true },
];

const INITIAL_PRICE_CONFIG = { superadmin:1.0, dealer:1.05, agent:1.10, customer:1.15 };

const DEFAULT_SETTINGS = {
  appName:"Achievers Tech Hub", appTagline:"Fast & Reliable Data Top-Up",
  appLogo:"", supportPhone:"", supportEmail:"", supportWhatsapp:"",
  welcomeMessage:"Welcome! Top up your data bundle fast and easy.",
  primaryColor:"#7c3aed", sidebarColor:"#1e0a3c",
  paystackPublicKey:"", paystackCurrency:"GHS",
  mailHost:"smtp.gmail.com", mailPort:"587", mailUsername:"",
  mailPassword:"", mailEncryption:"tls", mailFromAddress:"", mailFromName:"ATH Data Bundle",
  maintenanceMode:false, registrationOpen:true, minTopup:1,
};

// ── Shared UI ──────────────────────────────────────────────────────────────────
function Badge({ role }) {
  return (
    <span style={{ background:ROLE_COLORS[role]+"22", color:ROLE_COLORS[role], padding:"2px 10px",
      borderRadius:20, fontSize:11, fontWeight:600, textTransform:"capitalize" }}>{role}</span>
  );
}

function StatusBadge({ status }) {
  const m = { completed:["#D1FAE5","#065F46"], pending:["#FEF9C3","#854D0E"], failed:["#FEE2E2","#991B1B"] };
  const [bg,tx] = m[status]||m.pending;
  return <span style={{ background:bg, color:tx, padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:600, textTransform:"capitalize" }}>{status}</span>;
}

function Alert({ type="info", children, onClose }) {
  const s = { success:{bg:"#ECFDF5",border:"#6EE7B7",color:"#065F46"}, error:{bg:"#FEE2E2",border:"#FCA5A5",color:"#991B1B"}, info:{bg:"#EFF6FF",border:"#BFDBFE",color:"#1E40AF"} }[type];
  return (
    <div style={{ background:s.bg, border:`1px solid ${s.border}`, color:s.color, padding:"11px 16px", borderRadius:10, marginBottom:14,
      display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:13 }}>
      <span>{children}</span>
      {onClose && <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:s.color, lineHeight:1 }}>×</button>}
    </div>
  );
}

function Btn({ children, variant="primary", size="md", full, onClick, disabled, style:extra={} }) {
  const base = { display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, border:"none",
    borderRadius:9, fontFamily:"inherit", fontWeight:600, cursor:disabled?"not-allowed":"pointer",
    transition:"all 0.15s", opacity:disabled?0.55:1 };
  const vars = {
    primary:{ background:"linear-gradient(135deg,#7c3aed,#5b21b6)", color:"#fff" },
    success:{ background:"#059669", color:"#fff" },
    danger: { background:"#fee2e2", color:"#dc2626", border:"1px solid #fca5a5" },
    outline:{ background:"#fff", color:"#374151", border:"1px solid #e5e7eb" },
  };
  const sizes = { sm:{ padding:"5px 12px", fontSize:12 }, md:{ padding:"9px 18px", fontSize:13 }, lg:{ padding:"13px 24px", fontSize:15 } };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...base, ...vars[variant], ...sizes[size], ...(full?{width:"100%"}:{}), ...extra }}>
      {children}
    </button>
  );
}

function Modal({ title, onClose, children, width=400 }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:300,
      display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:"#fff", borderRadius:18, padding:28, width:"100%", maxWidth:width, maxHeight:"90vh", overflowY:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <h3 style={{ margin:0, fontSize:17, fontWeight:700 }}>{title}</h3>
          {onClose && <button onClick={onClose} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#9ca3af" }}>×</button>}
        </div>
        {children}
      </div>
    </div>
  );
}

function Card({ children, style={} }) {
  return <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e5e7eb", padding:20, ...style }}>{children}</div>;
}

function StatCard({ label, value, icon, bg="#fff" }) {
  return (
    <div style={{ background:bg, borderRadius:14, padding:"18px 20px", border:"1px solid #e5e7eb", flex:1, minWidth:0 }}>
      <div style={{ fontSize:22, marginBottom:6 }}>{icon}</div>
      <div style={{ fontSize:13, color:"#6b7280", marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:22, fontWeight:700, color:"#1a1a2e" }}>{value}</div>
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────
function Sidebar({ user, activePage, setActivePage, onLogout, settings }) {
  const { appName, appTagline, appLogo, sidebarColor, primaryColor } = settings;
  const adminMenu = [
    { key:"dashboard", icon:"🏠", label:"Dashboard" },
    { key:"buy",       icon:"🛒", label:"Buy Bundles" },
    { key:"users",     icon:"👥", label:"Users" },
    { key:"pricing",   icon:"💰", label:"Pricing" },
    { key:"bundles",   icon:"📦", label:"Manage Bundles" },
    { key:"orders",    icon:"📋", label:"All Orders" },
    { key:"wallet",    icon:"👛", label:"Wallet" },
    { key:"settings",  icon:"⚙️", label:"Settings" },
  ];
  const userMenu = [
    { key:"dashboard", icon:"🏠", label:"Dashboard" },
    { key:"buy",       icon:"🛒", label:"Buy Bundles" },
    { key:"orders",    icon:"📋", label:"My Orders" },
    { key:"wallet",    icon:"👛", label:"Wallet" },
  ];
  const menu = user.role === "superadmin" ? adminMenu : userMenu;

  return (
    <div style={{ width:224, minHeight:"100vh", background:`linear-gradient(160deg,${sidebarColor} 0%,${sidebarColor}bb 100%)`,
      display:"flex", flexDirection:"column", padding:"0 0 20px", position:"fixed", top:0, left:0, zIndex:100 }}>
      {/* Brand */}
      <div style={{ padding:"20px 18px 14px", borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
        {appLogo
          ? <img src={appLogo} alt="logo" style={{ maxHeight:44, maxWidth:160, objectFit:"contain", marginBottom:10, borderRadius:6, display:"block" }} />
          : <div style={{ width:42, height:42, borderRadius:12, background:`linear-gradient(135deg,#a78bfa,${primaryColor})`,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, marginBottom:10 }}>📶</div>
        }
        <div style={{ color:"#fff", fontWeight:800, fontSize:13 }}>{appName}</div>
        <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11, marginTop:2 }}>{appTagline}</div>
      </div>
      {/* User */}
      <div style={{ padding:"12px 18px", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
          <div style={{ width:36, height:36, borderRadius:"50%", background:`linear-gradient(135deg,#a78bfa,${primaryColor})`,
            display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:15, flexShrink:0 }}>
            {user.name[0]}
          </div>
          <div>
            <div style={{ color:"#fff", fontWeight:600, fontSize:13 }}>{user.name}</div>
            <Badge role={user.role} />
          </div>
        </div>
        <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11 }}>{user.email}</div>
      </div>
      {/* Nav */}
      <nav style={{ flex:1, padding:"10px 0" }}>
        {menu.map(item => (
          <button key={item.key} onClick={() => setActivePage(item.key)} style={{
            display:"flex", alignItems:"center", gap:11, width:"100%", padding:"10px 18px",
            border:"none", cursor:"pointer", textAlign:"left", fontSize:13.5, fontFamily:"inherit",
            background: activePage===item.key ? "rgba(124,58,237,0.3)" : "transparent",
            color: activePage===item.key ? "#c4b5fd" : "rgba(255,255,255,0.6)",
            fontWeight: activePage===item.key ? 600 : 400,
            borderLeft: activePage===item.key ? `3px solid ${primaryColor}` : "3px solid transparent",
            transition:"all 0.15s",
          }}>
            <span style={{ fontSize:16, width:20, textAlign:"center" }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      {/* Footer */}
      <div style={{ padding:"0 14px" }}>
        <div style={{ background:"rgba(255,255,255,0.07)", borderRadius:10, padding:"10px 14px", marginBottom:10, border:"1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ color:"rgba(255,255,255,0.45)", fontSize:11 }}>Wallet Balance</div>
          <div style={{ color:"#4ade80", fontWeight:700, fontSize:16 }}>{fmtGHS(user.balance)}</div>
        </div>
        <button onClick={onLogout} style={{ width:"100%", padding:"9px 0", borderRadius:8,
          background:"rgba(239,68,68,0.12)", color:"#fca5a5", border:"1px solid rgba(239,68,68,0.2)",
          cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"inherit" }}>🚪 Sign Out</button>
      </div>
    </div>
  );
}

function TopBar({ title, user }) {
  return (
    <div style={{ position:"fixed", top:0, left:224, right:0, height:60, zIndex:90, background:"#fff",
      borderBottom:"1px solid #f0f0f0", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px" }}>
      <h2 style={{ margin:0, fontSize:19, fontWeight:700, color:"#1a1a2e" }}>{title}</h2>
      <div style={{ fontSize:13, color:"#6b7280" }}>Welcome, <strong style={{ color:"#1a1a2e" }}>{user.name.split(" ")[0]}</strong></div>
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────────
function DashboardPage({ user, orders, allUsers, setActivePage }) {
  const mine = user.role === "superadmin" ? orders : orders.filter(o => o.userId === user.id);
  const spent = mine.filter(o => o.status === "completed").reduce((s,o) => s+o.price, 0);
  return (
    <div>
      <div style={{ display:"flex", gap:14, marginBottom:20, flexWrap:"wrap" }}>
        <StatCard label="Wallet Balance" value={fmtGHS(user.balance)} icon="💰" bg="#EDE9FE" />
        <StatCard label="Total Orders"   value={mine.length}          icon="📦" bg="#E0F2FE" />
        <StatCard label="Pending"        value={mine.filter(o=>o.status==="pending").length}   icon="⏳" bg="#FFF7ED" />
        <StatCard label="Completed"      value={mine.filter(o=>o.status==="completed").length} icon="✅" bg="#ECFDF5" />
      </div>
      {user.role === "superadmin" && (
        <div style={{ display:"flex", gap:14, marginBottom:20, flexWrap:"wrap" }}>
          <StatCard label="Total Users" value={allUsers.length}                              icon="👥" bg="#F3E8FF" />
          <StatCard label="Revenue"     value={fmt(spent)}                                   icon="📈" bg="#FEF3C7" />
          <StatCard label="Dealers"     value={allUsers.filter(u=>u.role==="dealer").length} icon="🏪" bg="#ECFDF5" />
          <StatCard label="Agents"      value={allUsers.filter(u=>u.role==="agent").length}  icon="🧑‍💼" bg="#E0F2FE" />
        </div>
      )}
      {user.role !== "superadmin" && (
        <div style={{ display:"flex", gap:12, marginBottom:20 }}>
          <Btn size="lg" onClick={() => setActivePage("buy")}>🛒 Buy Bundle</Btn>
          <Btn size="lg" variant="outline" onClick={() => setActivePage("wallet")}>👛 Top Up Wallet</Btn>
        </div>
      )}
      <Card>
        <h3 style={{ margin:"0 0 16px", fontSize:16, fontWeight:700 }}>Recent Orders</h3>
        {mine.length === 0
          ? <div style={{ textAlign:"center", padding:"32px 0", color:"#9ca3af" }}><div style={{ fontSize:40, marginBottom:8 }}>📭</div>No orders yet</div>
          : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead><tr style={{ borderBottom:"2px solid #f3f4f6" }}>
                  {["Order ID","Phone","Network","Bundle","Amount","Status","Date"].map(h=>(
                    <th key={h} style={{ textAlign:"left", padding:"8px 10px", color:"#6b7280", fontWeight:600 }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {mine.slice(-5).reverse().map(o=>(
                    <tr key={o.id} style={{ borderBottom:"1px solid #f3f4f6" }}>
                      <td style={{ padding:"10px", fontFamily:"monospace", color:"#7c3aed", fontSize:12 }}>#{o.id}</td>
                      <td style={{ padding:"10px" }}>{o.phone}</td>
                      <td style={{ padding:"10px" }}>
                        <span style={{ background:NETWORK_COLORS[o.network]?.bg, color:NETWORK_COLORS[o.network]?.text,
                          padding:"2px 8px", borderRadius:20, fontSize:11, fontWeight:600 }}>{o.network}</span>
                      </td>
                      <td style={{ padding:"10px", fontWeight:600 }}>{o.bundle}</td>
                      <td style={{ padding:"10px", fontWeight:700, color:"#059669" }}>{fmt(o.price)}</td>
                      <td style={{ padding:"10px" }}><StatusBadge status={o.status} /></td>
                      <td style={{ padding:"10px", color:"#6b7280" }}>{o.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </Card>
    </div>
  );
}

// ── Buy Bundles — ALL roles ────────────────────────────────────────────────────
function BuyBundlesPage({ user, priceConfig, onOrder, bundles }) {
  const [activeNet, setActiveNet] = useState("MTN");
  const [phone, setPhone]         = useState("");
  const [selected, setSelected]   = useState(null);
  const [msg, setMsg]             = useState(null);
  const [confirming, setConfirm]  = useState(false);

  const activeBundles = bundles.filter(b => b.network === activeNet && b.active !== false);
  const multiplier    = priceConfig[user.role] || 1.15;
  const getPrice      = base => (base * multiplier).toFixed(2);

  const handleBuy = () => {
    if (!phone || phone.length < 10) { setMsg({ type:"error", text:"Enter a valid phone number." }); return; }
    if (!selected)                    { setMsg({ type:"error", text:"Select a bundle." }); return; }
    if (user.balance < parseFloat(getPrice(selected.basePrice))) { setMsg({ type:"error", text:"Insufficient wallet balance. Top up first." }); return; }
    setConfirm(true);
  };

  const confirmOrder = () => {
    const price = parseFloat(getPrice(selected.basePrice));
    onOrder({ id:genId(), userId:user.id, userName:user.name, phone, network:selected.network,
      bundle:selected.size, price, status:"completed", date:new Date().toLocaleDateString() }, price);
    setMsg({ type:"success", text:`✅ ${selected.size} ${selected.network} bundle sent to ${phone}!` });
    setConfirm(false); setPhone(""); setSelected(null);
  };

  return (
    <div>
      {msg && <Alert type={msg.type} onClose={() => setMsg(null)}>{msg.text}</Alert>}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:14, marginBottom:20 }}>
        <div style={{ background:"#EDE9FE", borderRadius:14, padding:"18px 20px", border:"1px solid #e5e7eb" }}>
          <div style={{ fontSize:12, color:"#6b7280" }}>Wallet Balance</div>
          <div style={{ fontSize:22, fontWeight:800, color:"#7c3aed" }}>{fmtGHS(user.balance)}</div>
        </div>
        <Card>
          <label style={{ display:"block", fontSize:12, fontWeight:500, color:"#374151", marginBottom:6 }}>Recipient Phone Number</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 0244123456"
            style={{ width:"100%", padding:"10px 13px", border:"1px solid #d1d5db", borderRadius:9, fontSize:14, boxSizing:"border-box" }} />
        </Card>
      </div>

      {/* Network tabs */}
      <div style={{ display:"flex", gap:4, background:"#f3f4f6", padding:4, borderRadius:11, marginBottom:20 }}>
        {NETWORKS.map(n => (
          <button key={n} onClick={() => { setActiveNet(n); setSelected(null); }} style={{
            flex:1, padding:"10px 0", border:"none", cursor:"pointer", borderRadius:8,
            fontWeight:600, fontSize:13, fontFamily:"inherit", transition:"all 0.15s",
            background: activeNet === n ? NETWORK_COLORS[n].bg : "transparent",
            color:      activeNet === n ? NETWORK_COLORS[n].text : "#6b7280",
          }}>{n}</button>
        ))}
      </div>

      {activeBundles.length === 0
        ? <div style={{ textAlign:"center", padding:"32px 0", color:"#9ca3af" }}>No active bundles for {activeNet}.</div>
        : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(148px,1fr))", gap:12, marginBottom:20 }}>
            {activeBundles.map(b => {
              const sel = selected?.id === b.id;
              return (
                <div key={b.id} onClick={() => setSelected(b)} style={{
                  borderRadius:12, cursor:"pointer", overflow:"hidden",
                  border: sel ? "2px solid #7c3aed" : "2px solid transparent",
                  boxShadow: sel ? "0 0 0 4px rgba(124,58,237,0.15)" : "none", transition:"all 0.15s",
                }}>
                  <div style={{ background:NETWORK_COLORS[b.network].bg, padding:"12px 14px" }}>
                    <div style={{ fontSize:10, fontWeight:700, color:NETWORK_COLORS[b.network].text, opacity:0.7 }}>{b.network}</div>
                    <div style={{ fontSize:23, fontWeight:800, color:NETWORK_COLORS[b.network].text }}>{b.size}</div>
                  </div>
                  <div style={{ background:"#1a1a2e", padding:"8px 14px" }}>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.45)" }}>Price</div>
                    <div style={{ fontSize:16, fontWeight:700, color:"#fff" }}>¢{getPrice(b.basePrice)}</div>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)" }}>No Expiry</div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      }

      <Btn full size="lg" disabled={!selected || !phone} onClick={handleBuy}>
        {selected ? `Buy ${selected.size} for ¢${getPrice(selected.basePrice)}` : "Select a Bundle"}
      </Btn>

      {confirming && selected && (
        <Modal title="Confirm Purchase" onClose={() => setConfirm(false)}>
          <div style={{ background:"#f9fafb", borderRadius:10, padding:16, marginBottom:20 }}>
            {[["Network",selected.network],["Bundle",selected.size],["Phone",phone]].map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ color:"#6b7280" }}>{k}</span><strong>{v}</strong>
              </div>
            ))}
            <div style={{ display:"flex", justifyContent:"space-between", borderTop:"1px solid #e5e7eb", paddingTop:10 }}>
              <span style={{ color:"#6b7280" }}>Total</span>
              <strong style={{ color:"#7c3aed", fontSize:20 }}>¢{getPrice(selected.basePrice)}</strong>
            </div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <Btn variant="outline" full onClick={() => setConfirm(false)}>Cancel</Btn>
            <Btn full onClick={confirmOrder}>Confirm & Buy</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Wallet ─────────────────────────────────────────────────────────────────────
function WalletPage({ user, transactions, onTopup, settings }) {
  const [amount, setAmount]   = useState("");
  const [loading, setLoading] = useState(false);

  const handlePaystack = () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 1) return;
    if (!settings.paystackPublicKey) { alert("Paystack not configured. Contact admin."); return; }
    setLoading(true);
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = () => {
      window.PaystackPop.setup({
        key: settings.paystackPublicKey,
        email: user.email, amount: Math.round(amt * 100),
        currency: settings.paystackCurrency || "GHS", ref: "ATH_" + genId(),
        callback: res => { onTopup(amt, res.reference); setAmount(""); setLoading(false); },
        onClose: () => setLoading(false),
      }).openIframe();
    };
    document.body.appendChild(script);
  };

  const myTx = transactions.filter(t => t.userId === user.id);

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24 }}>
        <div style={{ background:"linear-gradient(135deg,#7c3aed,#5b21b6)", borderRadius:16, padding:"22px 24px", color:"#fff" }}>
          <div style={{ fontSize:12, opacity:0.7, marginBottom:4 }}>Total Balance</div>
          <div style={{ fontSize:34, fontWeight:800 }}>{fmtGHS(user.balance)}</div>
          <div style={{ fontSize:11, opacity:0.6, marginTop:4 }}>{user.email}</div>
        </div>
        <Card>
          <div style={{ fontSize:13, color:"#6b7280", marginBottom:10, fontWeight:600 }}>Top Up via Paystack</div>
          <div style={{ display:"flex", gap:8, marginBottom:8 }}>
            <input value={amount} onChange={e => setAmount(e.target.value)} type="number" min="1" placeholder="Amount (GHS)"
              style={{ flex:1, padding:"8px 12px", border:"1px solid #d1d5db", borderRadius:8, fontSize:14 }} />
            <button onClick={handlePaystack} disabled={loading || !amount}
              style={{ padding:"8px 16px", background:"#0a9b5a", color:"#fff", border:"none", borderRadius:8, fontWeight:700, cursor:"pointer", fontSize:13 }}>
              {loading ? "..." : "Pay"}
            </button>
          </div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {[10,20,50,100].map(q => (
              <button key={q} onClick={() => setAmount(String(q))}
                style={{ padding:"4px 10px", background:"#f3f4f6", border:"1px solid #e5e7eb", borderRadius:6, fontSize:12, cursor:"pointer", fontWeight:600 }}>
                GHS {q}
              </button>
            ))}
          </div>
        </Card>
      </div>
      <Card>
        <h3 style={{ margin:"0 0 16px", fontSize:16, fontWeight:700 }}>Transaction History</h3>
        {myTx.length === 0
          ? <div style={{ textAlign:"center", padding:"24px 0", color:"#9ca3af" }}>No transactions yet</div>
          : myTx.slice().reverse().map(t => (
            <div key={t.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid #f3f4f6" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:38, height:38, borderRadius:"50%", background:t.type==="topup"?"#ECFDF5":"#FEF3C7",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>
                  {t.type === "topup" ? "⬆️" : "📦"}
                </div>
                <div>
                  <div style={{ fontWeight:600, fontSize:14 }}>{t.description}</div>
                  <div style={{ fontSize:12, color:"#9ca3af" }}>{t.date} · {t.ref}</div>
                </div>
              </div>
              <div style={{ fontWeight:700, color:t.type==="topup"?"#059669":"#DC2626", fontSize:15 }}>
                {t.type === "topup" ? "+" : "-"}{fmtGHS(t.amount)}
              </div>
            </div>
          ))
        }
      </Card>
    </div>
  );
}

// ── Orders ─────────────────────────────────────────────────────────────────────
function OrdersPage({ user, orders }) {
  const [filterNet, setFilterNet] = useState("All");
  const [filterSt,  setFilterSt]  = useState("All");
  const mine = user.role === "superadmin" ? orders : orders.filter(o => o.userId === user.id);
  const list = mine.filter(o =>
    (filterNet === "All" || o.network === filterNet) &&
    (filterSt  === "All" || o.status  === filterSt)
  );
  return (
    <div>
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        <select value={filterNet} onChange={e => setFilterNet(e.target.value)}
          style={{ padding:"8px 12px", border:"1px solid #d1d5db", borderRadius:8, fontSize:13 }}>
          <option value="All">All Networks</option>
          {NETWORKS.map(n => <option key={n}>{n}</option>)}
        </select>
        <select value={filterSt} onChange={e => setFilterSt(e.target.value)}
          style={{ padding:"8px 12px", border:"1px solid #d1d5db", borderRadius:8, fontSize:13 }}>
          {["All","completed","pending","failed"].map(s => <option key={s}>{s}</option>)}
        </select>
        <span style={{ marginLeft:"auto", color:"#6b7280", fontSize:13, alignSelf:"center" }}>
          {list.length} order{list.length !== 1 ? "s" : ""}
        </span>
      </div>
      <Card style={{ padding:0 }}>
        {list.length === 0
          ? <div style={{ textAlign:"center", padding:"48px 0", color:"#9ca3af" }}><div style={{ fontSize:48, marginBottom:8 }}>📭</div>No orders found</div>
          : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead><tr style={{ background:"#f9fafb" }}>
                  {["Order ID", ...(user.role==="superadmin"?["User"]:[]), "Phone","Network","Bundle","Amount","Status","Date"].map(h => (
                    <th key={h} style={{ padding:"12px 14px", textAlign:"left", color:"#6b7280", fontWeight:600, borderBottom:"1px solid #e5e7eb" }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {list.slice().reverse().map(o => (
                    <tr key={o.id} style={{ borderBottom:"1px solid #f3f4f6" }}>
                      <td style={{ padding:"12px 14px", fontFamily:"monospace", color:"#7c3aed", fontSize:12 }}>#{o.id}</td>
                      {user.role === "superadmin" && <td style={{ padding:"12px 14px" }}>{o.userName}</td>}
                      <td style={{ padding:"12px 14px" }}>{o.phone}</td>
                      <td style={{ padding:"12px 14px" }}>
                        <span style={{ background:NETWORK_COLORS[o.network]?.bg, color:NETWORK_COLORS[o.network]?.text,
                          padding:"2px 8px", borderRadius:20, fontSize:11, fontWeight:600 }}>{o.network}</span>
                      </td>
                      <td style={{ padding:"12px 14px", fontWeight:600 }}>{o.bundle}</td>
                      <td style={{ padding:"12px 14px", fontWeight:700, color:"#059669" }}>{fmt(o.price)}</td>
                      <td style={{ padding:"12px 14px" }}><StatusBadge status={o.status} /></td>
                      <td style={{ padding:"12px 14px", color:"#6b7280" }}>{o.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </Card>
    </div>
  );
}

// ── Users ──────────────────────────────────────────────────────────────────────
function UsersPage({ users, setUsers }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm]       = useState({ name:"", email:"", password:"", role:"customer", phone:"" });
  const [err, setErr]         = useState("");

  const addUser = () => {
    if (!form.name || !form.email || !form.password) { setErr("Fill all required fields."); return; }
    if (users.find(u => u.email === form.email))     { setErr("Email already exists."); return; }
    setUsers(p => [...p, { id:genId(), ...form, balance:0, active:true, createdAt:new Date().toLocaleDateString() }]);
    setForm({ name:"", email:"", password:"", role:"customer", phone:"" });
    setShowAdd(false); setErr("");
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <span style={{ color:"#6b7280", fontSize:14 }}>{users.length} total users</span>
        <Btn onClick={() => setShowAdd(true)}>+ Add User</Btn>
      </div>

      {showAdd && (
        <Card style={{ marginBottom:16 }}>
          <h4 style={{ margin:"0 0 14px", fontWeight:700 }}>New User</h4>
          {err && <Alert type="error">{err}</Alert>}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {[["Full Name","name","text"],["Email","email","email"],["Password","password","password"],["Phone","phone","text"]].map(([l,k,t]) => (
              <div key={k}>
                <label style={{ fontSize:12, color:"#6b7280", display:"block", marginBottom:4 }}>{l}</label>
                <input type={t} value={form[k]} onChange={e => setForm(f => ({...f,[k]:e.target.value}))}
                  style={{ width:"100%", padding:"8px 10px", border:"1px solid #d1d5db", borderRadius:8, fontSize:13, boxSizing:"border-box" }} />
              </div>
            ))}
            <div>
              <label style={{ fontSize:12, color:"#6b7280", display:"block", marginBottom:4 }}>Role</label>
              <select value={form.role} onChange={e => setForm(f => ({...f,role:e.target.value}))}
                style={{ width:"100%", padding:"8px 10px", border:"1px solid #d1d5db", borderRadius:8, fontSize:13, boxSizing:"border-box" }}>
                {["customer","agent","dealer"].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:14 }}>
            <Btn variant="outline" onClick={() => { setShowAdd(false); setErr(""); }}>Cancel</Btn>
            <Btn onClick={addUser}>Create User</Btn>
          </div>
        </Card>
      )}

      <Card style={{ padding:0 }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead><tr style={{ background:"#f9fafb" }}>
              {["Name","Email","Phone","Role","Balance","Status","Action"].map(h => (
                <th key={h} style={{ padding:"12px 14px", textAlign:"left", color:"#6b7280", fontWeight:600, borderBottom:"1px solid #e5e7eb" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom:"1px solid #f3f4f6", opacity:u.active?1:0.55 }}>
                  <td style={{ padding:"12px 14px", fontWeight:600 }}>{u.name}</td>
                  <td style={{ padding:"12px 14px", color:"#6b7280" }}>{u.email}</td>
                  <td style={{ padding:"12px 14px" }}>{u.phone}</td>
                  <td style={{ padding:"12px 14px" }}><Badge role={u.role} /></td>
                  <td style={{ padding:"12px 14px", fontWeight:700, color:"#059669" }}>{fmtGHS(u.balance)}</td>
                  <td style={{ padding:"12px 14px" }}>
                    <span style={{ background:u.active?"#ECFDF5":"#FEE2E2", color:u.active?"#065F46":"#991B1B",
                      padding:"2px 8px", borderRadius:20, fontSize:11, fontWeight:600 }}>
                      {u.active ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td style={{ padding:"12px 14px" }}>
                    {u.role !== "superadmin" && (
                      <Btn variant="outline" size="sm" style={{ color:u.active?"#dc2626":"#059669" }}
                        onClick={() => setUsers(p => p.map(x => x.id===u.id ? {...x,active:!x.active} : x))}>
                        {u.active ? "Suspend" : "Activate"}
                      </Btn>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── Pricing ────────────────────────────────────────────────────────────────────
function PricingPage({ priceConfig, setPriceConfig }) {
  const [cfg, setCfg]   = useState({...priceConfig});
  const [saved, setSaved] = useState(false);
  const save = () => { setPriceConfig(cfg); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <div>
      <p style={{ color:"#6b7280", marginBottom:20, fontSize:14 }}>Price = Base Price × Multiplier.</p>
      <Card style={{ maxWidth:480 }}>
        {["dealer","agent","customer"].map(role => (
          <div key={role} style={{ marginBottom:22 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <Badge role={role} /><span style={{ fontSize:13, color:"#6b7280" }}>markup</span>
              </div>
              <strong style={{ fontSize:15 }}>{((cfg[role]-1)*100).toFixed(0)}% above base</strong>
            </div>
            <input type="range" min="1.00" max="1.50" step="0.01" value={cfg[role]}
              onChange={e => setCfg(c => ({...c,[role]:parseFloat(e.target.value)}))} style={{ width:"100%" }} />
            <div style={{ background:"#f9fafb", borderRadius:8, padding:"8px 12px", marginTop:8, fontSize:13 }}>
              <span style={{ color:"#6b7280" }}>5 GB MTN → </span>
              <strong style={{ color:"#7c3aed" }}>¢{(21.00*cfg[role]).toFixed(2)}</strong>
              <span style={{ color:"#9ca3af" }}> (base ¢21.00)</span>
            </div>
          </div>
        ))}
        <Btn onClick={save} style={{ marginTop:8, background:saved?"#059669":"" }}>
          {saved ? "✓ Saved!" : "Save Pricing"}
        </Btn>
      </Card>
    </div>
  );
}

// ── Manage Bundles (SuperAdmin) ────────────────────────────────────────────────
function ManageBundlesPage({ bundles, setBundles, priceConfig }) {
  const [newB, setNewB]   = useState({ network:"MTN", size:"", basePrice:"" });
  const [editId, setEditId] = useState(null);
  const [editB, setEditB]   = useState({});
  const [msg, setMsg]       = useState(null);

  const iSt = { padding:"7px 10px", border:"1px solid #d1d5db", borderRadius:8, fontSize:13, fontFamily:"inherit", boxSizing:"border-box" };

  const addBundle = () => {
    if (!newB.size.trim() || !newB.basePrice) { setMsg({ type:"error", text:"Size and price are required." }); return; }
    setBundles(p => [...p, { id:genId(), network:newB.network, size:newB.size.trim(), basePrice:parseFloat(newB.basePrice), active:true }]);
    setNewB({ network:"MTN", size:"", basePrice:"" });
    setMsg({ type:"success", text:"Bundle added successfully!" });
    setTimeout(() => setMsg(null), 2500);
  };

  const saveEdit = (id) => {
    if (!editB.size.trim() || !editB.basePrice) return;
    setBundles(p => p.map(b => b.id===id ? {...b, network:editB.network, size:editB.size.trim(), basePrice:parseFloat(editB.basePrice)} : b));
    setEditId(null);
  };

  const toggleBundle = id => setBundles(p => p.map(b => b.id===id ? {...b,active:!b.active} : b));
  const deleteBundle  = id => { if (window.confirm("Delete this bundle?")) setBundles(p => p.filter(b => b.id!==id)); };

  return (
    <div>
      {msg && <Alert type={msg.type} onClose={() => setMsg(null)}>{msg.text}</Alert>}

      {/* Add form */}
      <Card style={{ marginBottom:20 }}>
        <h3 style={{ margin:"0 0 14px", fontSize:15, fontWeight:700 }}>➕ Add New Bundle</h3>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr auto", gap:12, alignItems:"end" }}>
          <div>
            <label style={{ fontSize:12, color:"#6b7280", display:"block", marginBottom:4 }}>Network</label>
            <select value={newB.network} onChange={e => setNewB(b => ({...b,network:e.target.value}))} style={{ ...iSt, width:"100%" }}>
              {NETWORKS.map(n => <option key={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:12, color:"#6b7280", display:"block", marginBottom:4 }}>Size</label>
            <input value={newB.size} onChange={e => setNewB(b => ({...b,size:e.target.value}))} placeholder="e.g. 1 GB" style={{ ...iSt, width:"100%" }} />
          </div>
          <div>
            <label style={{ fontSize:12, color:"#6b7280", display:"block", marginBottom:4 }}>Base Price (¢)</label>
            <input type="number" value={newB.basePrice} onChange={e => setNewB(b => ({...b,basePrice:e.target.value}))} placeholder="e.g. 4.20" step="0.01" min="0.01" style={{ ...iSt, width:"100%" }} />
          </div>
          <Btn onClick={addBundle}>Add Bundle</Btn>
        </div>
      </Card>

      {/* Per-network tables */}
      {NETWORKS.map(network => {
        const nb = bundles.filter(b => b.network === network);
        const dm = priceConfig.dealer||1.05, am = priceConfig.agent||1.10, cm = priceConfig.customer||1.15;
        return (
          <Card key={network} style={{ marginBottom:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
              <span style={{ background:NETWORK_COLORS[network].bg, color:NETWORK_COLORS[network].text,
                padding:"5px 16px", borderRadius:20, fontWeight:700, fontSize:14 }}>{network}</span>
              <span style={{ color:"#9ca3af", fontSize:13 }}>
                {nb.length} bundle{nb.length!==1?"s":""} · {nb.filter(b=>b.active).length} active
              </span>
            </div>
            {nb.length === 0
              ? <div style={{ textAlign:"center", padding:"14px 0", color:"#9ca3af", fontSize:13 }}>No bundles. Add one above.</div>
              : (
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                    <thead><tr style={{ background:"#f9fafb" }}>
                      {["Size","Base Price","Dealer","Agent","Customer","Status","Actions"].map(h => (
                        <th key={h} style={{ padding:"10px 12px", textAlign:"left", color:"#6b7280", fontWeight:600, borderBottom:"1px solid #e5e7eb", whiteSpace:"nowrap" }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {[...nb].sort((a,b)=>a.basePrice-b.basePrice).map(b => (
                        <tr key={b.id} style={{ borderBottom:"1px solid #f3f4f6", opacity:b.active?1:0.5 }}>
                          {editId === b.id ? (
                            <>
                              <td style={{ padding:"8px 12px" }}>
                                <input value={editB.size} onChange={e => setEditB(x => ({...x,size:e.target.value}))} style={{ ...iSt, width:80 }} />
                              </td>
                              <td style={{ padding:"8px 12px" }}>
                                <input type="number" value={editB.basePrice} onChange={e => setEditB(x => ({...x,basePrice:e.target.value}))} step="0.01" min="0.01" style={{ ...iSt, width:80 }} />
                              </td>
                              <td style={{ padding:"8px 12px" }}>
                                <select value={editB.network} onChange={e => setEditB(x => ({...x,network:e.target.value}))} style={iSt}>
                                  {NETWORKS.map(n => <option key={n}>{n}</option>)}
                                </select>
                              </td>
                              <td colSpan={3} />
                              <td style={{ padding:"8px 12px" }}>
                                <div style={{ display:"flex", gap:6 }}>
                                  <Btn size="sm" onClick={() => saveEdit(b.id)}>💾 Save</Btn>
                                  <Btn size="sm" variant="outline" onClick={() => setEditId(null)}>Cancel</Btn>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td style={{ padding:"10px 12px", fontWeight:700 }}>{b.size}</td>
                              <td style={{ padding:"10px 12px" }}>¢{b.basePrice.toFixed(2)}</td>
                              <td style={{ padding:"10px 12px", color:"#6b7280" }}>¢{(b.basePrice*dm).toFixed(2)}</td>
                              <td style={{ padding:"10px 12px", color:"#6b7280" }}>¢{(b.basePrice*am).toFixed(2)}</td>
                              <td style={{ padding:"10px 12px", color:"#6b7280" }}>¢{(b.basePrice*cm).toFixed(2)}</td>
                              <td style={{ padding:"10px 12px" }}>
                                <span style={{ background:b.active?"#ECFDF5":"#FEE2E2", color:b.active?"#065F46":"#991B1B",
                                  padding:"2px 8px", borderRadius:20, fontSize:11, fontWeight:600 }}>
                                  {b.active?"Active":"Inactive"}
                                </span>
                              </td>
                              <td style={{ padding:"10px 12px" }}>
                                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                                  <Btn size="sm" variant="outline" onClick={() => { setEditId(b.id); setEditB({network:b.network,size:b.size,basePrice:b.basePrice}); }}>✏️ Edit</Btn>
                                  <Btn size="sm" variant="outline" style={{ color:b.active?"#dc2626":"#059669" }} onClick={() => toggleBundle(b.id)}>
                                    {b.active?"Deactivate":"Activate"}
                                  </Btn>
                                  <Btn size="sm" variant="danger" onClick={() => deleteBundle(b.id)}>🗑</Btn>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
          </Card>
        );
      })}
    </div>
  );
}

// ── Settings (SuperAdmin) ──────────────────────────────────────────────────────
function SettingsPage({ settings, setSettings }) {
  const [tab,  setTab]  = useState("general");
  const [form, setForm] = useState({...settings});
  const [saved, setSaved] = useState("");
  const upd = (k,v) => setForm(f => ({...f,[k]:v}));
  const save = section => { setSettings({...form}); setSaved(section); setTimeout(()=>setSaved(""),2500); };

  const iSt = { width:"100%", padding:"10px 13px", border:"1px solid #d1d5db", borderRadius:9, fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box" };
  const lSt = { display:"block", fontSize:12, fontWeight:500, color:"#374151", marginBottom:5 };

  const TABS = [
    { key:"general",  icon:"⚙️",  label:"General" },
    { key:"paystack", icon:"💳",  label:"Paystack" },
    { key:"email",    icon:"📧",  label:"Email / SMTP" },
    { key:"system",   icon:"🛡️", label:"System" },
  ];

  const SaveBar = ({ section }) => (
    <div style={{ display:"flex", justifyContent:"flex-end", paddingTop:18, marginTop:10, borderTop:"1px solid #f3f4f6" }}>
      <Btn onClick={() => save(section)} style={{ background: saved===section?"#059669":"" }}>
        {saved===section ? "✓ Saved!" : "💾 Save Settings"}
      </Btn>
    </div>
  );

  const Toggle = ({ label, sub, field }) => (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 0", borderBottom:"1px solid #f3f4f6" }}>
      <div>
        <div style={{ fontWeight:600, fontSize:14 }}>{label}</div>
        {sub && <div style={{ fontSize:12, color:"#6b7280", marginTop:2 }}>{sub}</div>}
      </div>
      <div onClick={() => upd(field, !form[field])} style={{
        width:44, height:24, borderRadius:24, cursor:"pointer", position:"relative", flexShrink:0,
        background:form[field]?"#7c3aed":"#d1d5db", transition:"background 0.2s",
      }}>
        <div style={{ position:"absolute", width:18, height:18, borderRadius:"50%", background:"#fff",
          top:3, left:form[field]?23:3, transition:"left 0.2s" }} />
      </div>
    </div>
  );

  return (
    <div>
      {/* Tabs */}
      <div style={{ display:"flex", gap:4, background:"#f3f4f6", padding:4, borderRadius:12, marginBottom:24, flexWrap:"wrap" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex:1, minWidth:100, padding:"10px 14px", border:"none", borderRadius:9, fontFamily:"inherit",
            fontWeight:600, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6,
            background: tab===t.key?"#fff":"transparent",
            color:      tab===t.key?"#7c3aed":"#6b7280",
            boxShadow:  tab===t.key?"0 1px 4px rgba(0,0,0,0.08)":"none",
            transition:"all 0.15s",
          }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {/* General */}
      {tab === "general" && (
        <Card>
          <h3 style={{ margin:"0 0 4px", fontSize:15, fontWeight:700 }}>Branding & Identity</h3>
          <p style={{ color:"#6b7280", fontSize:13, marginBottom:20 }}>Customize your platform name, logo, colors and contact info.</p>

          <div style={{ marginBottom:18 }}>
            <label style={lSt}>System Logo</label>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:72, height:52, background:"#f3f4f6", borderRadius:10, border:"1px solid #e5e7eb",
                display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", flexShrink:0 }}>
                {form.appLogo ? <img src={form.appLogo} alt="logo" style={{ maxHeight:"100%", maxWidth:"100%", objectFit:"contain" }} /> : <span style={{ fontSize:26 }}>📶</span>}
              </div>
              <div style={{ flex:1 }}>
                <input type="text" value={form.appLogo} onChange={e => upd("appLogo",e.target.value)}
                  placeholder="Paste image URL (https://...)" style={iSt} />
                <div style={{ fontSize:11, color:"#9ca3af", marginTop:4 }}>PNG, JPG or SVG URL. Recommended size: 200×60px</div>
              </div>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div><label style={lSt}>System Name *</label><input value={form.appName} onChange={e=>upd("appName",e.target.value)} placeholder="ATH Data Bundle" style={iSt}/></div>
            <div><label style={lSt}>Tagline</label><input value={form.appTagline} onChange={e=>upd("appTagline",e.target.value)} placeholder="Fast & Reliable Data" style={iSt}/></div>
            <div><label style={lSt}>Support Phone</label><input value={form.supportPhone} onChange={e=>upd("supportPhone",e.target.value)} placeholder="0244000000" style={iSt}/></div>
            <div><label style={lSt}>Support WhatsApp</label><input value={form.supportWhatsapp} onChange={e=>upd("supportWhatsapp",e.target.value)} placeholder="0244000000" style={iSt}/></div>
            <div style={{ gridColumn:"span 2" }}><label style={lSt}>Support Email</label><input type="email" value={form.supportEmail} onChange={e=>upd("supportEmail",e.target.value)} placeholder="support@yourdomain.com" style={iSt}/></div>
            <div style={{ gridColumn:"span 2" }}><label style={lSt}>Welcome Message <span style={{ color:"#9ca3af",fontWeight:400 }}>(shown on login)</span></label><input value={form.welcomeMessage} onChange={e=>upd("welcomeMessage",e.target.value)} style={iSt}/></div>
          </div>

          <div style={{ borderTop:"1px solid #f3f4f6", paddingTop:18, marginTop:18 }}>
            <label style={{ ...lSt, marginBottom:12 }}>Theme Colors</label>
            <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
              {[["Primary Color","primaryColor"],["Sidebar Background","sidebarColor"]].map(([lbl,key])=>(
                <div key={key}>
                  <div style={{ fontSize:12, color:"#6b7280", marginBottom:6 }}>{lbl}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <input type="color" value={form[key]} onChange={e=>upd(key,e.target.value)}
                      style={{ width:40, height:36, border:"1px solid #e5e7eb", borderRadius:8, cursor:"pointer", padding:2 }} />
                    <input type="text" value={form[key]} onChange={e=>upd(key,e.target.value)}
                      style={{ ...iSt, width:90 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <SaveBar section="general" />
        </Card>
      )}

      {/* Paystack */}
      {tab === "paystack" && (
        <Card>
          <h3 style={{ margin:"0 0 4px", fontSize:15, fontWeight:700 }}>Paystack Payment Gateway</h3>
          <p style={{ color:"#6b7280", fontSize:13, marginBottom:20 }}>
            Get your keys from{" "}
            <a href="https://dashboard.paystack.com/#/settings/developer" target="_blank" rel="noreferrer"
              style={{ color:"#7c3aed", fontWeight:600 }}>Paystack Dashboard → Settings → API Keys</a>.
          </p>

          <div style={{ marginBottom:14 }}>
            <label style={lSt}>Public Key *</label>
            <input value={form.paystackPublicKey} onChange={e=>upd("paystackPublicKey",e.target.value)}
              placeholder="pk_live_xxxxxxxxxxxxxxxxxxxxxxxx"
              style={{ ...iSt, fontFamily:"monospace", fontSize:12 }} />
            <div style={{ fontSize:11, color:"#9ca3af", marginTop:4 }}>Starts with pk_live_ (production) or pk_test_ (testing)</div>
          </div>

          <div style={{ marginBottom:14 }}>
            <label style={lSt}>Currency</label>
            <select value={form.paystackCurrency} onChange={e=>upd("paystackCurrency",e.target.value)} style={iSt}>
              {[["GHS","Ghana Cedi (GHS)"],["NGN","Nigerian Naira (NGN)"],["USD","US Dollar (USD)"],["KES","Kenyan Shilling (KES)"]].map(([v,l])=>(
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          <div style={{ background:"#FEFCE8", border:"1px solid #FDE68A", borderRadius:10, padding:"12px 16px" }}>
            <div style={{ fontWeight:600, fontSize:13, color:"#854D0E", marginBottom:4 }}>💡 Security Note</div>
            <div style={{ fontSize:12, color:"#92400E" }}>
              The secret key should be kept on your server only. In the Laravel version, set <code>PAYSTACK_SECRET_KEY</code> in your <code>.env</code> file.
            </div>
          </div>
          <SaveBar section="paystack" />
        </Card>
      )}

      {/* Email */}
      {tab === "email" && (
        <Card>
          <h3 style={{ margin:"0 0 4px", fontSize:15, fontWeight:700 }}>SMTP Email Configuration</h3>
          <p style={{ color:"#6b7280", fontSize:13, marginBottom:18 }}>Configure outgoing email for receipts and notifications.</p>

          <div style={{ background:"#f9fafb", borderRadius:10, padding:"12px 16px", marginBottom:18 }}>
            <div style={{ fontSize:11, fontWeight:600, color:"#6b7280", marginBottom:8 }}>QUICK PRESETS</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {[["Gmail","smtp.gmail.com","587","tls"],["Mailgun","smtp.mailgun.org","587","tls"],["SendGrid","smtp.sendgrid.net","587","tls"],["cPanel","mail.yourdomain.com","465","ssl"],["Outlook","smtp.office365.com","587","tls"]].map(([name,host,port,enc])=>(
                <Btn key={name} size="sm" variant="outline" onClick={()=>setForm(f=>({...f,mailHost:host,mailPort:port,mailEncryption:enc}))}>
                  {name}
                </Btn>
              ))}
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div><label style={lSt}>SMTP Host *</label><input value={form.mailHost} onChange={e=>upd("mailHost",e.target.value)} placeholder="smtp.gmail.com" style={iSt}/></div>
            <div><label style={lSt}>SMTP Port *</label><input type="number" value={form.mailPort} onChange={e=>upd("mailPort",e.target.value)} placeholder="587" style={iSt}/></div>
            <div><label style={lSt}>Username / Email *</label><input value={form.mailUsername} onChange={e=>upd("mailUsername",e.target.value)} placeholder="your@gmail.com" style={iSt}/></div>
            <div><label style={lSt}>Password / App Password</label><input type="password" value={form.mailPassword} onChange={e=>upd("mailPassword",e.target.value)} placeholder="••••••••" style={iSt}/></div>
            <div>
              <label style={lSt}>Encryption *</label>
              <select value={form.mailEncryption} onChange={e=>upd("mailEncryption",e.target.value)} style={iSt}>
                <option value="tls">TLS (recommended)</option>
                <option value="ssl">SSL</option>
                <option value="none">None</option>
              </select>
            </div>
            <div><label style={lSt}>From Name *</label><input value={form.mailFromName} onChange={e=>upd("mailFromName",e.target.value)} placeholder="ATH Data Bundle" style={iSt}/></div>
            <div style={{ gridColumn:"span 2" }}><label style={lSt}>From Email *</label><input type="email" value={form.mailFromAddress} onChange={e=>upd("mailFromAddress",e.target.value)} placeholder="noreply@yourdomain.com" style={iSt}/></div>
          </div>
          <SaveBar section="email" />
        </Card>
      )}

      {/* System */}
      {tab === "system" && (
        <div>
          <Card style={{ marginBottom:16 }}>
            <h3 style={{ margin:"0 0 4px", fontSize:15, fontWeight:700 }}>System Controls</h3>
            <p style={{ color:"#6b7280", fontSize:13, marginBottom:10 }}>Manage system-wide behaviour and access.</p>
            <Toggle label="🔧 Maintenance Mode" sub="When ON, only superadmins can log in." field="maintenanceMode" />
            <Toggle label="📝 Open Registration" sub="Allow new users to self-register." field="registrationOpen" />
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 0" }}>
              <div>
                <div style={{ fontWeight:600, fontSize:14 }}>💰 Minimum Top-Up Amount (GHS)</div>
                <div style={{ fontSize:12, color:"#6b7280", marginTop:2 }}>Minimum amount for wallet top-up.</div>
              </div>
              <input type="number" value={form.minTopup} onChange={e=>upd("minTopup",parseFloat(e.target.value)||1)}
                min="1" step="0.5" style={{ width:90, padding:"8px 10px", border:"1px solid #d1d5db", borderRadius:8, fontSize:14, textAlign:"center" }} />
            </div>
            <SaveBar section="system" />
          </Card>

          <div style={{ background:"#F0FDF4", borderRadius:14, border:"1px solid #BBF7D0", padding:20 }}>
            <h3 style={{ margin:"0 0 14px", fontSize:15, fontWeight:700, color:"#065F46" }}>📊 App Info</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, fontSize:13 }}>
              {[["Type","React SPA"],["Auth","Session (in-memory)"],["Storage","useState (browser session)"],["Roles","SuperAdmin, Dealer, Agent, Customer"],["Networks","MTN, Telecel, AirtelTigo"],["Payments","Paystack"]].map(([k,v])=>(
                <div key={k}><span style={{ color:"#6b7280" }}>{k}:</span> <strong>{v}</strong></div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Auth Pages ─────────────────────────────────────────────────────────────────
function LoginPage({ onLogin, onSwitchToRegister, settings }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const { appName, appTagline, appLogo, primaryColor, welcomeMessage } = settings;
  const submit = () => { if (!onLogin(email, password)) setError("Invalid email or password."); };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#1e0a3c 0%,#2d1b69 60%,#1e3a5f 100%)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ width:"100%", maxWidth:400 }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          {appLogo
            ? <img src={appLogo} alt="logo" style={{ maxHeight:60, maxWidth:180, objectFit:"contain", marginBottom:14, borderRadius:8 }} />
            : <div style={{ width:66, height:66, borderRadius:16, background:`linear-gradient(135deg,#a78bfa,${primaryColor})`,
                display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", fontSize:32 }}>📶</div>
          }
          <h1 style={{ color:"#fff", margin:"0 0 6px", fontSize:26, fontWeight:800 }}>{appName}</h1>
          <p style={{ color:"rgba(255,255,255,0.5)", margin:0, fontSize:14 }}>{welcomeMessage || appTagline}</p>
        </div>

        <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:20, padding:28, border:"1px solid rgba(255,255,255,0.1)" }}>
          <h2 style={{ color:"#fff", margin:"0 0 20px", fontSize:20, fontWeight:700 }}>Sign In</h2>
          {error && <div style={{ background:"#FEE2E2", color:"#991B1B", padding:"10px 14px", borderRadius:8, marginBottom:16, fontSize:13 }}>{error}</div>}
          {[["Email Address","email",email,setEmail],["Password","password",password,setPassword]].map(([lbl,type,val,set]) => (
            <div key={lbl} style={{ marginBottom:14 }}>
              <label style={{ color:"rgba(255,255,255,0.65)", fontSize:13, display:"block", marginBottom:6 }}>{lbl}</label>
              <input type={type} value={val} onChange={e => { set(e.target.value); setError(""); }}
                onKeyDown={e => e.key==="Enter" && submit()}
                placeholder={type==="email"?"you@email.com":"••••••••"}
                style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.15)",
                  background:"rgba(255,255,255,0.08)", color:"#fff", fontSize:14, boxSizing:"border-box" }} />
            </div>
          ))}
          <button onClick={submit} style={{ width:"100%", padding:13, background:`linear-gradient(135deg,#a78bfa,${primaryColor})`,
            color:"#fff", border:"none", borderRadius:10, fontWeight:700, fontSize:15, cursor:"pointer" }}>Sign In</button>
          <p style={{ color:"rgba(255,255,255,0.4)", textAlign:"center", marginTop:16, fontSize:13 }}>
            Don't have an account?{" "}
            <button onClick={onSwitchToRegister} style={{ background:"none", border:"none", color:"#a78bfa", cursor:"pointer", fontWeight:600, fontSize:13, padding:0 }}>Create Account</button>
          </p>
        </div>

        <div style={{ marginTop:18, background:"rgba(255,255,255,0.04)", borderRadius:12, padding:"12px 16px", border:"1px solid rgba(255,255,255,0.07)" }}>
          <p style={{ color:"rgba(255,255,255,0.35)", fontSize:10, margin:"0 0 8px", fontWeight:600, letterSpacing:0.5 }}>DEMO ACCOUNTS</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
            {[["admin@ath.com","admin123","superadmin"],["dealer@ath.com","pass123","dealer"],["agent@ath.com","pass123","agent"],["customer@ath.com","pass123","customer"]].map(([e,p,r]) => (
              <button key={e} onClick={() => { setEmail(e); setPassword(p); }}
                style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:6,
                  color:"rgba(255,255,255,0.55)", padding:"4px 10px", cursor:"pointer", fontSize:11, fontFamily:"inherit" }}>
                Use {r}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RegisterPage({ onRegister, onSwitchToLogin, settings }) {
  const [form, setForm] = useState({ name:"", email:"", phone:"", password:"", confirm:"", role:"customer" });
  const [error, setError] = useState("");
  const { appName, primaryColor, appLogo } = settings;

  const submit = () => {
    if (!form.name||!form.email||!form.phone||!form.password) { setError("All fields required."); return; }
    if (form.password !== form.confirm) { setError("Passwords don't match."); return; }
    if (!onRegister(form)) setError("Email already exists.");
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#1e0a3c 0%,#2d1b69 60%,#1e3a5f 100%)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ width:"100%", maxWidth:440 }}>
        <div style={{ textAlign:"center", marginBottom:22 }}>
          {appLogo ? <img src={appLogo} alt="logo" style={{ maxHeight:48, marginBottom:10, borderRadius:8 }} /> : <div style={{ fontSize:36, marginBottom:8 }}>📶</div>}
          <h1 style={{ color:"#fff", margin:0, fontSize:24, fontWeight:800 }}>{appName}</h1>
        </div>
        <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:20, padding:28, border:"1px solid rgba(255,255,255,0.1)" }}>
          <h2 style={{ color:"#fff", margin:"0 0 18px", fontSize:18, fontWeight:700 }}>Create Account</h2>
          {error && <div style={{ background:"#FEE2E2", color:"#991B1B", padding:"10px 14px", borderRadius:8, marginBottom:14, fontSize:13 }}>{error}</div>}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[["Full Name","name","text",true],["Email","email","email"],["Phone","phone","tel"],["Password","password","password"],["Confirm Password","confirm","password",true]].map(([lbl,k,t,full]) => (
              <div key={k} style={{ gridColumn:full?"span 2":undefined }}>
                <label style={{ color:"rgba(255,255,255,0.6)", fontSize:12, display:"block", marginBottom:4 }}>{lbl}</label>
                <input type={t} value={form[k]} onChange={e => { setForm(f=>({...f,[k]:e.target.value})); setError(""); }}
                  style={{ width:"100%", padding:"10px 12px", borderRadius:9, border:"1px solid rgba(255,255,255,0.15)",
                    background:"rgba(255,255,255,0.08)", color:"#fff", fontSize:13, boxSizing:"border-box" }} />
              </div>
            ))}
            <div>
              <label style={{ color:"rgba(255,255,255,0.6)", fontSize:12, display:"block", marginBottom:4 }}>Account Type</label>
              <select value={form.role} onChange={e => setForm(f=>({...f,role:e.target.value}))}
                style={{ width:"100%", padding:"10px 12px", borderRadius:9, border:"1px solid rgba(255,255,255,0.15)",
                  background:"#2d1b69", color:"#fff", fontSize:13, boxSizing:"border-box" }}>
                <option value="customer">Customer</option>
                <option value="agent">Agent</option>
                <option value="dealer">Dealer</option>
              </select>
            </div>
          </div>
          <button onClick={submit} style={{ width:"100%", padding:13, background:`linear-gradient(135deg,#a78bfa,${primaryColor})`,
            color:"#fff", border:"none", borderRadius:10, fontWeight:700, fontSize:15, cursor:"pointer", marginTop:14 }}>
            Create Account
          </button>
          <p style={{ color:"rgba(255,255,255,0.4)", textAlign:"center", marginTop:14, fontSize:13 }}>
            Already have an account?{" "}
            <button onClick={onSwitchToLogin} style={{ background:"none", border:"none", color:"#a78bfa", cursor:"pointer", fontWeight:600, fontSize:13, padding:0 }}>Sign In</button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── App Root ───────────────────────────────────────────────────────────────────
export default function App() {
  const [authPage,     setAuthPage]     = useState("login");
  const [currentUser,  setCurrentUser]  = useState(null);
  const [users,        setUsers]        = useState(INITIAL_USERS);
  const [bundles,      setBundles]      = useState(INITIAL_BUNDLES);
  const [orders,       setOrders]       = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [priceConfig,  setPriceConfig]  = useState(INITIAL_PRICE_CONFIG);
  const [activePage,   setActivePage]   = useState("dashboard");
  const [settings,     setSettings]     = useState(DEFAULT_SETTINGS);

  const handleLogin = (email, password) => {
    const user = users.find(u => u.email===email && u.password===password && u.active);
    if (user) { setCurrentUser(user); setActivePage("dashboard"); return true; }
    return false;
  };

  const handleRegister = (form) => {
    if (!settings.registrationOpen) return false;
    if (users.find(u => u.email===form.email)) return false;
    const u = { id:genId(), name:form.name, email:form.email, password:form.password,
      role:form.role, phone:form.phone, balance:0, active:true, createdAt:new Date().toLocaleDateString() };
    setUsers(p => [...p, u]);
    setCurrentUser(u);
    setActivePage("dashboard");
    return true;
  };

  const handleOrder = (order, price) => {
    setOrders(p => [...p, order]);
    const updated = {...currentUser, balance:parseFloat((currentUser.balance-price).toFixed(2))};
    setCurrentUser(updated);
    setUsers(p => p.map(u => u.id===currentUser.id ? updated : u));
    setTransactions(p => [...p, { id:genId(), userId:currentUser.id, type:"purchase", amount:price,
      description:`${order.network} ${order.bundle} → ${order.phone}`, date:new Date().toLocaleDateString(), ref:order.id }]);
  };

  const handleTopup = (amount, ref) => {
    const updated = {...currentUser, balance:parseFloat((currentUser.balance+amount).toFixed(2))};
    setCurrentUser(updated);
    setUsers(p => p.map(u => u.id===currentUser.id ? updated : u));
    setTransactions(p => [...p, { id:genId(), userId:currentUser.id, type:"topup", amount,
      description:"Wallet Top-Up via Paystack", date:new Date().toLocaleDateString(), ref }]);
  };

  const handleLogout = () => { setCurrentUser(null); setAuthPage("login"); };

  useEffect(() => {
    if (currentUser) {
      const fresh = users.find(u => u.id===currentUser.id);
      if (fresh && fresh.balance !== currentUser.balance) setCurrentUser(fresh);
    }
  }, [users]);

  if (!currentUser) {
    if (authPage === "register") return <RegisterPage onRegister={handleRegister} onSwitchToLogin={()=>setAuthPage("login")} settings={settings} />;
    return <LoginPage onLogin={handleLogin} onSwitchToRegister={()=>setAuthPage("register")} settings={settings} />;
  }

  const PAGE_TITLES = {
    dashboard:"Dashboard", buy:"Buy Bundles", orders:"Orders",
    wallet:"Wallet", users:"User Management", pricing:"Pricing Config",
    bundles:"Manage Bundles", settings:"Settings",
  };

  const renderPage = () => {
    switch(activePage) {
      case "dashboard": return <DashboardPage user={currentUser} orders={orders} allUsers={users} setActivePage={setActivePage} />;
      case "buy":       return <BuyBundlesPage user={currentUser} priceConfig={priceConfig} onOrder={handleOrder} bundles={bundles} />;
      case "orders":    return <OrdersPage user={currentUser} orders={orders} />;
      case "wallet":    return <WalletPage user={currentUser} transactions={transactions} onTopup={handleTopup} settings={settings} />;
      case "users":     return currentUser.role==="superadmin" ? <UsersPage users={users} setUsers={setUsers} /> : null;
      case "pricing":   return currentUser.role==="superadmin" ? <PricingPage priceConfig={priceConfig} setPriceConfig={setPriceConfig} /> : null;
      case "bundles":   return currentUser.role==="superadmin" ? <ManageBundlesPage bundles={bundles} setBundles={setBundles} priceConfig={priceConfig} /> : null;
      case "settings":  return currentUser.role==="superadmin" ? <SettingsPage settings={settings} setSettings={setSettings} /> : null;
      default:          return <DashboardPage user={currentUser} orders={orders} allUsers={users} setActivePage={setActivePage} />;
    }
  };

  return (
    <div style={{ fontFamily:"'Segoe UI',system-ui,sans-serif", background:"#f5f5f7", minHeight:"100vh" }}>
      <Sidebar user={currentUser} activePage={activePage} setActivePage={setActivePage} onLogout={handleLogout} settings={settings} />
      <TopBar title={PAGE_TITLES[activePage]||"Dashboard"} user={currentUser} />
      <main style={{ marginLeft:224, paddingTop:60 }}>
        <div style={{ padding:28 }}>{renderPage()}</div>
      </main>
    </div>
  );
}
