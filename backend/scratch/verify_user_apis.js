
const BASE_URL = "http://127.0.0.1:5001/api";

async function testRegistration() {
  console.log("--- Testing Registration ---");
  const payload = {
    name: "Test User",
    phonenum: "9876543210",
    email: "test@example.com"
  };

  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  console.log("Registration Response:", data);
  return data;
}

async function testPincode() {
  console.log("\n--- Testing Pincode Lookup ---");
  const pincode = "110001";
  const response = await fetch(`${BASE_URL}/addresses/pincode/${pincode}`);
  const data = await response.json();
  console.log(`Pincode ${pincode} Response:`, data);
}

async function runTests() {
  try {
    await testRegistration();
    await testPincode();
  } catch (err) {
    console.error("Test failed:", err.message);
  }
}

runTests();
