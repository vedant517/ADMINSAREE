import Address from "../../models/Address.js";

// ADD ADDRESS
export const createAddress = async (req, res) => {
  try {
    const { 
      firstName, lastName, email, phoneNumber,
      address, country, state, city, zipCode 
    } = req.body;

    if (!firstName || !lastName || !email || !phoneNumber || !address || !country || !state || !city || !zipCode) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required"
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
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET USER ADDRESSES
export const getMyAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE ADDRESS
export const updateAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user.id });
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    const updated = await Address.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE ADDRESS
export const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user.id });
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found or not authorized" });
    }
    await Address.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Address removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PINCODE LOOKUP
export const lookupPincode = async (req, res) => {
  const { pincode } = req.params;
  if (!pincode || pincode.length !== 6) {
    return res.status(400).json({ success: false, message: "Invalid 6-digit PIN code." });
  }
  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await response.json();
    if (data[0].Status === "Success") {
      const postOffice = data[0].PostOffice[0];
      return res.json({ 
        success: true, 
        data: {
          city: postOffice.Block,
          district: postOffice.District,
          state: postOffice.State,
          country: "India"
        } 
      });
    }
    res.status(404).json({ success: false, message: "No details found for this PIN code." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};