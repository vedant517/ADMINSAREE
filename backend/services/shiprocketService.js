/**
 * Mock Shiprocket Service for calculating delivery charges.
 * In a real scenario, this would call Shiprocket API:
 * https://apiv2.shiprocket.in/v2/console/shipping/check/serviceability
 */

export const calculateShippingCharges = async ({
  pickup_postcode = "110001", // Default warehouse
  delivery_postcode,
  weight,
  cod = 0,
}) => {
  try {
    // SIMULATION LOGIC:
    // Base charge: ₹50
    // Weight charge: ₹10 per 0.5kg
    // Distance charge (simplified): ₹20 if outside state (mocked by first 2 digits of pincode)
    
    if (!delivery_postcode) {
      return { success: false, message: "Delivery postcode required" };
    }

    const baseCharge = 50;
    const weightCharge = Math.ceil(weight / 0.5) * 10;
    const isLocal = delivery_postcode.substring(0, 2) === pickup_postcode.substring(0, 2);
    const distanceCharge = isLocal ? 0 : 40;

    const totalShipping = baseCharge + weightCharge + distanceCharge;

    // Return format similar to Shiprocket but simplified
    return {
      success: true,
      data: {
        shipping_cost: totalShipping,
        estimated_delivery_days: isLocal ? 2 : 5,
        courier_name: "Shiprocket Simulation",
      }
    };
  } catch (error) {
    console.error("Shiprocket simulation error:", error);
    return { success: false, message: "Error calculating shipping" };
  }
};
