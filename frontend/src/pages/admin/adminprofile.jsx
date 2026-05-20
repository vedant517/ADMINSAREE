import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";
import api from '../../services/api';

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[11px] text-slate-400 mb-1.5 mt-3 block font-medium">{label}</label>
      {children}
    </div>
  );
}

function TextInput({ style: extra, className: extraCls, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      className={`w-full text-[13px] px-3 py-2 border rounded-lg bg-[#fafafa] text-[#222] outline-none transition-all box-border ${focused ? 'border-[#85754E] shadow-[0_0_0_3px_rgba(147,131,89,0.10)] bg-white' : 'border-[#e8e8e8]'} ${extraCls || ''}`}
      style={extra}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

function PwInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full text-[13px] px-3 py-2 border rounded-lg bg-[#fafafa] text-[#222] outline-none transition-all box-border pr-8 ${focused ? 'border-[#85754E] shadow-[0_0_0_3px_rgba(147,131,89,0.10)] bg-white' : 'border-[#e8e8e8]'}`}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-0 cursor-pointer text-slate-400 text-sm p-0 leading-none"
      >
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
    firstName: "", lastName: "", email: "", phoneNumber: "",
    profileImageUrl: "", countryCode: "", dateOfBirth: "",
    address: { street: "", city: "", state: "", country: "", postalCode: "" },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/admin/profile');
        const data = res.data;
        if (data.success) {
          setProfile(data.data);
          setForm({
            firstName: data.data.firstName || "",
            lastName: data.data.lastName || "",
            email: data.data.email || "",
            phoneNumber: data.data.phoneNumber || "",
            profileImageUrl: data.data.profileImageUrl || "",
            countryCode: data.data.countryCode || "",
            dateOfBirth: data.data.dateOfBirth ? data.data.dateOfBirth.split("T")[0] : "",
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

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleAddressChange = (e) => setForm(f => ({ ...f, address: { ...f.address, [e.target.name]: e.target.value } }));

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const res = await api.put('/admin/profile', form);
      const data = res.data;
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
    if (!currentPassword) { toast.error("Enter your current password"); return; }
    if (!newPassword || newPassword.length < 6) { toast.error("New password must be at least 6 characters"); return; }
    if (newPassword !== reenterPassword) { toast.error("Passwords do not match"); return; }
    setPwSaving(true);
    try {
      const res = await api.put('/admin/profile/password', { currentPassword, newPassword });
      const data = res.data;
      if (data.success) {
        toast.success("Password updated");
        setCurrentPassword(""); setNewPassword(""); setReenterPassword("");
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
      const res = await api.post('/admin/profile/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const data = res.data;
      if (data.success) {
        setForm(f => ({ ...f, profileImageUrl: data.imageUrl }));
        setProfile(p => ({ ...p, profileImageUrl: data.imageUrl }));
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
      const res = await api.delete('/admin/profile/image');
      const data = res.data;
      if (data.success) {
        setForm(f => ({ ...f, profileImageUrl: "" }));
        setProfile(p => ({ ...p, profileImageUrl: "" }));
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
      <div className="flex items-center justify-center h-[60vh] text-slate-400 text-[13px] font-[DM_Sans,sans-serif]">
        Loading profile…
      </div>
    );
  }

  const initials = `${form.firstName?.[0] || ""}${form.lastName?.[0] || ""}`.toUpperCase() || "AD";

  const AvatarEl = ({ size = 56 }) =>
    form.profileImageUrl ? (
      <img
        src={form.profileImageUrl}
        alt="avatar"
        className="rounded-full object-cover border-[2.5px] border-white shadow-[0_0_0_1px_#FFF5E2]"
        style={{ width: size, height: size }}
      />
    ) : (
      <div
        className="rounded-full bg-gradient-to-br from-amber-100 to-amber-200 text-[#85754E] flex items-center justify-center font-bold flex-shrink-0 border-[2.5px] border-white shadow-[0_0_0_1px_#FFF5E2]"
        style={{ width: size, height: size, fontSize: size * 0.33 }}
      >
        {initials}
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f5f5f0] p-6 font-[DM_Sans,'Helvetica_Neue',Arial,sans-serif]">
      <Toaster
        position="top-right"
        toastOptions={{ style: { fontSize: 13, fontFamily: "'DM Sans', sans-serif", borderRadius: 10 } }}
      />

      <p className="text-[13px] font-semibold text-[#888] tracking-[0.1em] uppercase mb-5">Admin profile</p>

      <div className="grid gap-4" style={{ gridTemplateColumns: '320px 1fr', alignItems: 'start' }}>

        {/* ── LEFT COLUMN ── */}
        <div className="flex flex-col gap-3.5">

          {/* Profile snapshot */}
          <div className="bg-white rounded-2xl border border-[#ebebeb] px-5 py-5">
            <p className="text-[10px] font-bold text-[#aaa] tracking-[0.12em] uppercase pb-3 border-b border-[#f0f0f0] mb-4">Profile</p>

            <div className="flex flex-col items-center text-center py-1 pb-4">
              <div className="mb-3"><AvatarEl size={64} /></div>
              <p className="text-[15px] font-semibold text-[#1a1a1a] mb-0.5">{form.firstName} {form.lastName}</p>
              <p className="text-xs text-[#aaa]">{form.email}</p>
              {form.phoneNumber && (
                <p className="text-xs text-[#bbb] mt-0.5">
                  {form.countryCode ? `+${form.countryCode} ` : ""}{form.phoneNumber}
                </p>
              )}
            </div>

            <hr className="border-0 border-t border-[#f0f0f0] my-3.5" />
          </div>

          {/* Change password */}
          <div className="bg-white rounded-2xl border border-[#ebebeb] px-5 py-5">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-semibold text-[#1a1a1a]">Change password</p>
              <button className="bg-transparent text-[#85754E] border-0 text-xs cursor-pointer p-0 font-medium">Need help?</button>
            </div>

            <label className="text-[11px] text-[#999] mb-1 mt-0 block font-medium">Current password</label>
            <PwInput value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
            <button className="bg-transparent border-0 text-[#85754E] text-[11px] cursor-pointer p-0 font-medium mt-1.5 block">Forgot password?</button>

            <label className="text-[11px] text-[#999] mb-1 mt-3 block font-medium">New password</label>
            <PwInput value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 6 characters" />

            <label className="text-[11px] text-[#999] mb-1 mt-3 block font-medium">Confirm new password</label>
            <PwInput value={reenterPassword} onChange={(e) => setReenterPassword(e.target.value)} placeholder="Re-enter new password" />

            <button
              className="w-full mt-4 py-2.5 bg-[#85754E] text-white border-0 rounded-lg text-[13px] font-semibold cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-70"
              onClick={handlePasswordUpdate}
              disabled={pwSaving}
            >
              {pwSaving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="bg-white rounded-2xl border border-[#ebebeb] px-5 py-5">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm font-semibold text-[#1a1a1a]">Profile update</p>
            <button
              className="bg-transparent text-[#555] border border-[#e0e0e0] rounded-lg text-xs font-medium py-1.5 px-3.5 cursor-pointer hover:bg-slate-50"
              onClick={handleUpdate}
              disabled={saving}
            >
              ✎ Quick save
            </button>
          </div>

          {/* Avatar + URL input */}
          <div className="flex items-center gap-3 mb-1.5">
            <AvatarEl size={46} />
            <div className="flex items-center gap-2.5 flex-1">
              <div className="flex flex-col flex-1">
                <label className="text-[11px] text-[#888] mb-1">Image URL</label>
                <input
                  type="text"
                  placeholder="Paste image URL here..."
                  value={form.profileImageUrl}
                  onChange={(e) => setForm(f => ({ ...f, profileImageUrl: e.target.value }))}
                  className="w-full text-[13px] px-3 py-2 border border-[#e8e8e8] rounded-lg bg-white text-[#222] outline-none box-border"
                />
              </div>
              <button
                type="button"
                className="bg-[#85754E] text-white border-0 rounded-lg text-xs font-semibold px-3.5 py-2 whitespace-nowrap cursor-pointer hover:bg-[#837349] transition-colors"
                onClick={() => toast.success("Image URL updated")}
              >
                Apply
              </button>
            </div>
          </div>

          {/* Basic info */}
          <p className="text-[10px] font-bold text-[#aaa] tracking-[0.12em] uppercase py-2.5 border-t border-b border-[#f0f0f0] my-4">Basic info</p>
          <div className="grid grid-cols-2 gap-x-3.5">
            <Field label="First name">
              <TextInput name="firstName" value={form.firstName} onChange={handleChange} placeholder="First name" />
            </Field>
            <Field label="Last name">
              <TextInput name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last name" />
            </Field>
            <Field label="Email address">
              <TextInput name="email" value={form.email} onChange={handleChange} placeholder="email@example.com" className="col-span-2" />
            </Field>
            <Field label="Phone number">
              <div className="flex gap-1.5">
                <select
                  value={form.countryCode}
                  onChange={(e) => setForm(f => ({ ...f, countryCode: e.target.value }))}
                  className="w-20 flex-shrink-0 text-[13px] px-2 py-2 border border-[#e8e8e8] rounded-lg bg-[#fafafa] text-[#222] outline-none cursor-pointer"
                >
                  <option value="91">🇮🇳 +91</option>
                  <option value="1">🇺🇸 +1</option>
                  <option value="44">🇬🇧 +44</option>
                  <option value="61">🇦🇺 +61</option>
                  <option value="971">🇦🇪 +971</option>
                </select>
                <TextInput name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="Phone number" className="flex-1" />
              </div>
            </Field>
            <Field label="Date of birth">
              <TextInput type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
            </Field>
          </div>

          {/* Address */}
          <p className="text-[10px] font-bold text-[#aaa] tracking-[0.12em] uppercase py-2.5 border-t border-b border-[#f0f0f0] my-4">Address</p>
          <div className="grid grid-cols-2 gap-x-3.5">
            <Field label="Street address">
              <TextInput name="street" value={form.address.street} onChange={handleAddressChange} placeholder="Street address" />
            </Field>
            <Field label="City">
              <TextInput name="city" value={form.address.city} onChange={handleAddressChange} placeholder="City" />
            </Field>
            <Field label="State / Province">
              <TextInput name="state" value={form.address.state} onChange={handleAddressChange} placeholder="State" />
            </Field>
            <Field label="Country">
              <TextInput name="country" value={form.address.country} onChange={handleAddressChange} placeholder="Country" />
            </Field>
            <Field label="Postal / ZIP code">
              <TextInput name="postalCode" value={form.address.postalCode} onChange={handleAddressChange} placeholder="PIN / ZIP" />
            </Field>
          </div>

          {/* Footer */}
          <div className="flex justify-end mt-5 pt-4 border-t border-[#f0f0f0] gap-2.5">
            <button
              className="bg-transparent text-[#555] border border-[#e0e0e0] rounded-lg text-xs font-medium py-1.5 px-3.5 cursor-pointer hover:bg-slate-50"
              onClick={() => window.location.reload()}
            >
              Discard
            </button>
            <button
              className="bg-[#85754E] text-white border-0 rounded-lg text-[13px] font-semibold min-w-[130px] py-2 cursor-pointer hover:bg-[#837349] transition-colors disabled:opacity-70"
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