import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Address from "../../models/Address.js";

const router = express.Router();

const splitName = (fullName = "") => {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || parts[0] || "",
  };
};

const normalizeAddressPayload = (body) => {
  const shipping = body.shippingAddress || {};
  const nameParts = splitName(body.fullName || shipping.fullName);

  return {
    firstName: body.firstName || shipping.firstName || nameParts.firstName,
    lastName: body.lastName || shipping.lastName || nameParts.lastName,
    email: body.email || shipping.email || body.contact?.emailOrPhone,
    phoneNumber: body.phoneNumber || body.phone || shipping.phone || shipping.phoneNumber,
    address: body.address || shipping.address,
    country: body.country || shipping.country || "India",
    state: body.state || shipping.state,
    city: body.city || shipping.city,
    zipCode: body.zipCode || body.postalCode || shipping.zipCode || shipping.postalCode,
  };
};

// @route   POST /api/addresses
// @desc    Add a new shipping address (checkout form)
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ 
        success: false, 
        message: "Request body is missing." 
      });
    }

    const {
      firstName, lastName, email, phoneNumber,
      address, country, state, city, zipCode
    } = normalizeAddressPayload(req.body);

    // Validate required fields
    if (!firstName || !lastName || !email || !phoneNumber || !address || !country || !state || !city || !zipCode) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required: firstName, lastName, email, phoneNumber, address, country, state, city, zipCode"
      });
    }

    const newAddress = new Address({
      user: req.user.id,
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
      country,
      state,
      city,
      zipCode,
    });

    const savedAddress = await newAddress.save();
    res.status(201).json({ success: true, data: savedAddress });

  } catch (error) {
    console.error("Save address error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message || "Server error saving address" 
    });
  }
});

// @route   GET /api/addresses
// @desc    Get user's addresses
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: addresses });
  } catch (error) {
    console.error("Fetch addresses error:", error);
    res.status(500).json({ message: "Server error fetching addresses" });
  }
});

// @route   PUT /api/addresses/:id
// @desc    Update an address
// @access  Private
router.put("/:id", protect, async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user.id });
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    const { firstName, lastName, email, phoneNumber, address: addr, country, state, city, zipCode } = normalizeAddressPayload(req.body);
    const updated = await Address.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, email, phoneNumber, address: addr, country, state, city, zipCode },
      { new: true }
    );
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/addresses/:id
// @desc    Delete an address
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    if (address.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await Address.findByIdAndDelete(req.params.id);
    res.json({ message: "Address removed", success: true });
  } catch (error) {
    console.error("Delete address error:", error);
    res.status(500).json({ message: "Server error deleting address" });
  }
});

export default router;
