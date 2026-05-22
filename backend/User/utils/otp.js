/** Random 6-digit OTP for email authentication. */
export const generateEmailOtp = () =>
  String(Math.floor(100000 + Math.random() * 900000));

/** Static OTP for mobile authentication (per product requirement). */
export const MOBILE_STATIC_OTP = "123456";
