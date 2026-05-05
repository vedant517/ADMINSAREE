import Address from "../../models/Address.js";

//  CREATE ADDRESS
export const createAddress = async (req, res) => {
  try {
    const { userId, contact, shippingAddress } = req.body;

    if (!userId || !contact || !shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "userId, contact and shippingAddress are required",
      });
    }

    const address = await Address.create({
      userId,
      contact,
      shippingAddress,
    });

    res.status(201).json({
      success: true,
      data: address,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



//  GET ALL
export const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find();

    res.json({
      success: true,
      data: addresses,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


//  GET BY USER
export const getAddressesByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const addresses = await Address.find({ userId });

    res.json({
      success: true,
      data: addresses,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



//  UPDATE ADDRESS
export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, contact, shippingAddress } = req.body || {};

    const updatedAddress = await Address.findOneAndUpdate(
      { _id: id, userId }, // ensures ownership
      {
        ...(contact && { contact }),
        ...(shippingAddress && { shippingAddress }),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found or not yours",
      });
    }

    res.json({
      success: true,
      data: updatedAddress,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



//  DELETE ADDRESS
export const deleteAddress = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const address = await Address.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found or not yours",
      });
    }

    res.json({
      success: true,
      message: "Address deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};