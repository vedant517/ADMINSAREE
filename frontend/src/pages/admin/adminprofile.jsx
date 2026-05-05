import React, { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";
import { API_BASE_URL } from "../../services/apiConfig";


const S = {
  page: {
    minHeight: "100vh",
    background: "#f5f5f0",
    padding: "28px 24px",
    fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif",
  },
  pageTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "#888",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: 20,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    gap: 16,
    alignItems: "start",
  },
  card: {
    background: "#fff",
    borderRadius: 14,
    border: "1px solid #ebebeb",
    padding: "20px 22px",
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: "#aaa",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    paddingBottom: 12,
    borderBottom: "1px solid #f0f0f0",
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: "#aaa",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    padding: "10px 0",
    borderTop: "1px solid #f0f0f0",
    borderBottom: "1px solid #f0f0f0",
    margin: "18px 0 6px",
  },
  label: {
    fontSize: 11,
    color: "#999",
    marginBottom: 5,
    marginTop: 12,
    display: "block",
    fontWeight: 500,
  },
  input: {
    width: "100%",
    fontSize: 13,
    padding: "8px 11px",
    border: "1px solid #e8e8e8",
    borderRadius: 8,
    background: "#fafafa",
    color: "#222",
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
    boxSizing: "border-box",
  },
  inputFocus: {
    borderColor: "#3b82f6",
    boxShadow: "0 0 0 3px rgba(59,130,246,0.10)",
    background: "#fff",
  },
  row2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0 14px",
  },
  profileCenter: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "4px 0 16px",
  },
  avatar: (size = 56, fontSize = 19) => ({
    width: size,
    height: size,
    borderRadius: "50%",
    background: "linear-gradient(135deg,#dbeafe,#bfdbfe)",
    color: "#1d4ed8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize,
    fontWeight: 700,
    flexShrink: 0,
    border: "2.5px solid #fff",
    boxShadow: "0 0 0 1px #e0e7ff",
  }),
  avatarImg: (size = 56) => ({
    width: size,
    height: size,
    borderRadius: "50%",
    objectFit: "cover",
    border: "2.5px solid #fff",
    boxShadow: "0 0 0 1px #e0e7ff",
  }),
  chip: {
    fontSize: 11,
    color: "#555",
    background: "#f5f5f5",
    border: "1px solid #eaeaea",
    borderRadius: 20,
    padding: "3px 10px",
    display: "inline-block",
  },
  btnPrimary: (bg = "#1e40af") => ({
    background: bg,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    padding: "9px 20px",
    cursor: "pointer",
    transition: "opacity 0.15s",
  }),
  btnSecondary: {
    background: "none",
    color: "#555",
    border: "1px solid #e0e0e0",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 500,
    padding: "7px 14px",
    cursor: "pointer",
  },
  btnGhost: {
    background: "none",
    border: "none",
    color: "#3b82f6",
    fontSize: 11,
    cursor: "pointer",
    padding: 0,
    fontWeight: 500,
  },
  hr: { border: "none", borderTop: "1px solid #f0f0f0", margin: "14px 0" },
  eyeBtn: {
    position: "absolute",
    right: 9,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#aaa",
    fontSize: 14,
    padding: 0,
    lineHeight: 1,
  },
};


function Field({ label, children }) {
  return (
    <div>
      <label style={S.label}>{label}</label>
      {children}
    </div>
  );
}

function TextInput({ style: extra, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      style={{ ...S.input, ...(focused ? S.inputFocus : {}), ...extra }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

function PwInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          ...S.input,
          paddingRight: 32,
          ...(focused ? S.inputFocus : {}),
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <button style={S.eyeBtn} onClick={() => setShow((s) => !s)} type="button">
        {show ? "🙈" : "👁"}
      </button>
    </div>
  );
}


const AdminProfile = () => {
  const token = useSelector((state) => state.auth.token);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [reenterPassword, setReenterPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    profileImageUrl: "",
    countryCode: "",
    dateOfBirth: "",
    address: { street: "", city: "", state: "", country: "", postalCode: "" },
    
  });

  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setProfile(data.data);
          setForm({
            firstName: data.data.firstName || "",
            lastName: data.data.lastName || "",
            email: data.data.email || "",
            phoneNumber: data.data.phoneNumber || "",
            profileImageUrl: data.data.profileImageUrl || "",
            countryCode: data.data.countryCode || "",
            dateOfBirth: data.data.dateOfBirth
              ? data.data.dateOfBirth.split("T")[0]
              : "",
            address: {
              street: data.data.address?.street || "",
              city: data.data.address?.city || "",
              state: data.data.address?.state || "",
              country: data.data.address?.country || "",
              postalCode: data.data.address?.postalCode || "",
            },
            
          });
        } else {
          toast.error(data.message);
        }
      } catch {
        toast.error("Error loading profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

 
  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handleAddressChange = (e) =>
    setForm((f) => ({
      ...f,
      address: { ...f.address, [e.target.name]: e.target.value },
    }));
 

  
  const handleUpdate = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Profile updated successfully");
        setProfile(data.data);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

 
  const handlePasswordUpdate = async () => {
    if (!currentPassword) {
      toast.error("Enter your current password");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== reenterPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/profile/password`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        }
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Password updated");
        setCurrentPassword("");
        setNewPassword("");
        setReenterPassword("");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Password update failed");
    } finally {
      setPwSaving(false);
    }
  };

 
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("profileImage", file);
    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/profile/image`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      const data = await res.json();
      if (data.success) {
        setForm((f) => ({ ...f, profileImageUrl: data.imageUrl }));
        setProfile((p) => ({ ...p, profileImageUrl: data.imageUrl }));
        toast.success("Photo updated");
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch {
      toast.error("Image upload failed");
    }
  };

  const handleDeleteImage = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/profile/image`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success) {
        setForm((f) => ({ ...f, profileImageUrl: "" }));
        setProfile((p) => ({ ...p, profileImageUrl: "" }));
        toast.success("Photo removed");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Delete failed");
    }
  };

 
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
          color: "#aaa",
          fontSize: 13,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        Loading profile…
      </div>
    );
  }

  const initials =
    `${form.firstName?.[0] || ""}${form.lastName?.[0] || ""}`.toUpperCase() ||
    "AD";

  const AvatarEl = ({ size = 56 }) =>
    form.profileImageUrl ? (
      <img
        src={form.profileImageUrl}
        alt="avatar"
        style={S.avatarImg(size)}
      />
    ) : (
      <div style={S.avatar(size, size * 0.33)}>{initials}</div>
    );

 
  return (
    <div style={S.page}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontSize: 13,
            fontFamily: "'DM Sans', sans-serif",
            borderRadius: 10,
          },
        }}
      />

      <p style={S.pageTitle}>Admin profile</p>

      <div style={S.grid}>
        {/* ══ LEFT COLUMN ══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* ── Profile snapshot ── */}
          <div style={S.card}>
            <p style={S.cardLabel}>Profile</p>

            <div style={S.profileCenter}>
              <div style={{ marginBottom: 12 }}>
                <AvatarEl size={64} />
              </div>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#1a1a1a",
                  marginBottom: 2,
                }}
              >
                {form.firstName} {form.lastName}
              </p>
              <p style={{ fontSize: 12, color: "#aaa" }}>{form.email}</p>
              {form.phoneNumber && (
                <p style={{ fontSize: 12, color: "#bbb", marginTop: 2 }}>
                  {form.countryCode ? `+${form.countryCode} ` : ""}
                  {form.phoneNumber}
                </p>
              )}
            </div>

            <hr style={S.hr} />

            

            

            
          </div>

         
          <div style={S.card}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <p style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>
                Change password
              </p>
              <button style={S.btnGhost}>Need help?</button>
            </div>

            <label style={{ ...S.label, marginTop: 0 }}>Current password</label>
            <PwInput
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
            <button style={{ ...S.btnGhost, marginTop: 6, display: "block" }}>
              Forgot password?
            </button>

            <label style={S.label}>New password</label>
            <PwInput
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 6 characters"
            />

            <label style={S.label}>Confirm new password</label>
            <PwInput
              value={reenterPassword}
              onChange={(e) => setReenterPassword(e.target.value)}
              placeholder="Re-enter new password"
            />

            <button
              style={{
                ...S.btnPrimary("#15803d"),
                width: "100%",
                marginTop: 16,
                padding: "10px",
                opacity: pwSaving ? 0.7 : 1,
              }}
              onClick={handlePasswordUpdate}
              disabled={pwSaving}
            >
              {pwSaving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>

        
        <div style={S.card}>
          
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <p style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>
              Profile update
            </p>
            <button
              style={S.btnSecondary}
              onClick={handleUpdate}
              disabled={saving}
            >
              ✎ Quick save
            </button>
          </div>

          
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 6,
            }}
          >
            <AvatarEl size={46} />
            <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
  
  <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
    <label style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>
      Image URL
    </label>

    <input
      type="text"
      placeholder="Paste image URL here..."
      value={form.profileImageUrl}
      onChange={(e) =>
        setForm((f) => ({
          ...f,
          profileImageUrl: e.target.value,
        }))
      }
      style={{
        ...S.input,
        background: "#fff",
      }}
    />
  </div>

  <button
    type="button"
    style={{
      ...S.btnPrimary("#2563eb"),
      padding: "8px 14px",
      fontSize: 12,
      whiteSpace: "nowrap",
    }}
    onClick={() => {
      toast.success("Image URL updated");
    }}
  >
    Apply
  </button>

</div>

          </div>

          
          <p style={S.sectionLabel}>Basic info</p>
          <div style={S.row2}>
            <Field label="First name">
              <TextInput
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="First name"
              />
            </Field>
            <Field label="Last name">
              <TextInput
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Last name"
              />
            </Field>
            <Field label="Email address">
              <TextInput
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email@example.com"
                style={{ gridColumn: "1/-1" }}
              />
            </Field>
            <Field label="Phone number">
              <div style={{ display: "flex", gap: 6 }}>
                <select
                  value={form.countryCode}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, countryCode: e.target.value }))
                  }
                  style={{
                    ...S.input,
                    width: 82,
                    flexShrink: 0,
                    cursor: "pointer",
                  }}
                >
                  <option value="91">🇮🇳 +91</option>
                  <option value="1">🇺🇸 +1</option>
                  <option value="44">🇬🇧 +44</option>
                  <option value="61">🇦🇺 +61</option>
                  <option value="971">🇦🇪 +971</option>
                </select>
                <TextInput
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  placeholder="Phone number"
                  style={{ flex: 1 }}
                />
              </div>
            </Field>
            <Field label="Date of birth">
              <TextInput
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
              />
            </Field>
          </div>

          
          <p style={S.sectionLabel}>Address</p>
          <div style={S.row2}>
            <Field label="Street address">
              <TextInput
                name="street"
                value={form.address.street}
                onChange={handleAddressChange}
                placeholder="Street address"
              />
            </Field>
            <Field label="City">
              <TextInput
                name="city"
                value={form.address.city}
                onChange={handleAddressChange}
                placeholder="City"
              />
            </Field>
            <Field label="State / Province">
              <TextInput
                name="state"
                value={form.address.state}
                onChange={handleAddressChange}
                placeholder="State"
              />
            </Field>
            <Field label="Country">
              <TextInput
                name="country"
                value={form.address.country}
                onChange={handleAddressChange}
                placeholder="Country"
              />
            </Field>
            <Field label="Postal / ZIP code">
              <TextInput
                name="postalCode"
                value={form.address.postalCode}
                onChange={handleAddressChange}
                placeholder="PIN / ZIP"
              />
            </Field>
          </div>

          
         

          {/* Footer action */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 22,
              paddingTop: 16,
              borderTop: "1px solid #f0f0f0",
              gap: 10,
            }}
          >
            <button style={S.btnSecondary} onClick={() => window.location.reload()}>
              Discard
            </button>
            <button
              style={{
                ...S.btnPrimary("#2563eb"),
                opacity: saving ? 0.7 : 1,
                minWidth: 130,
              }}
              onClick={handleUpdate}
              disabled={saving}
            >
              {saving ? "Saving…" : "Update profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;