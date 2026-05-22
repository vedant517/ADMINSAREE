const OTP_TTL_MS = 5 * 60 * 1000;
const store = new Map();

export const OTP_EXPIRY_MS = OTP_TTL_MS;

export const saveOtp = (key, { otp, type }) => {
  store.set(key, {
    otp,
    type,
    expiry: Date.now() + OTP_TTL_MS,
    attempts: 0,
  });
};

export const getOtp = (key) => store.get(key) || null;

export const deleteOtp = (key) => store.delete(key);

export const verifyStoredOtp = (key, enteredOtp) => {
  const record = getOtp(key);
  if (!record) {
    return { ok: false, message: "OTP not found or expired. Please resend code." };
  }

  if (Date.now() > record.expiry) {
    deleteOtp(key);
    return { ok: false, message: "OTP has expired. Please resend code." };
  }

  if (record.attempts >= 5) {
    deleteOtp(key);
    return { ok: false, message: "Too many invalid attempts. Please resend OTP." };
  }

  const sanitized = String(enteredOtp || "").trim().replace(/\s/g, "");
  if (sanitized !== record.otp) {
    record.attempts += 1;
    return { ok: false, message: "Invalid OTP code. Please try again." };
  }

  deleteOtp(key);
  return { ok: true, type: record.type };
};
