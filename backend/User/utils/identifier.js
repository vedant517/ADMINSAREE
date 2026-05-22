const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;

/** Detect whether input is email or 10-digit Indian mobile. */
export const parseIdentifier = (rawInput) => {
  const raw = String(rawInput || "").trim();
  if (!raw) return null;

  if (raw.includes("@")) {
    const email = raw.toLowerCase();
    if (!EMAIL_REGEX.test(email)) {
      return { error: "Please enter a valid email address." };
    }
    return { key: email, type: "email", value: email };
  }

  const digits = raw.replace(/\D/g, "");
  const mobile =
    digits.length === 10
      ? digits
      : digits.length === 12 && digits.startsWith("91")
        ? digits.slice(2)
        : digits.length === 11 && digits.startsWith("0")
          ? digits.slice(1)
          : null;

  if (!mobile || !MOBILE_REGEX.test(mobile)) {
    return { error: "Please enter a valid 10-digit mobile number." };
  }

  return { key: mobile, type: "mobile", value: mobile };
};

export const findUserByIdentifier = async (User, identifier) => {
  if (!identifier?.key) return null;
  return identifier.type === "email"
    ? User.findOne({ email: identifier.key })
    : User.findOne({ phonenum: identifier.key });
};

/** Auto-register user on first successful OTP flow. */
export const ensureUserExists = async (User, identifier, name) => {
  let user = await findUserByIdentifier(User, identifier);
  if (user) return user;

  if (identifier.type === "mobile") {
    user = await User.create({
      name: name?.trim() || `User ${identifier.key.slice(-4)}`,
      phonenum: identifier.key,
      email: `${identifier.key}@mobile.sheetalya.local`,
      role: "user",
    });
    return user;
  }

  const localPart = identifier.key.split("@")[0] || "user";
  user = await User.create({
    name: name?.trim() || localPart,
    email: identifier.key,
    phonenum: `E${Date.now()}${Math.floor(Math.random() * 1000)}`,
    role: "user",
  });
  return user;
};
