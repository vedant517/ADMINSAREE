import Category from "../../User/models/Category.js";

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, isMain } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, "-");

    // Extract image URL safely — Cloudinary multer storage sets req.file.path as the secure URL
    // but sometimes req.file.secure_url or req.file.url is used depending on the storage engine
    let image = null;
    if (req.file) {
      image =
        req.file.secure_url ||   // cloudinary-storage v2
        req.file.path ||          // multer-storage-cloudinary (path = secure_url)
        req.file.url ||           // some custom setups
        null;
    } else if (req.body.imageUrl && typeof req.body.imageUrl === 'string' && req.body.imageUrl.trim()) {
      image = req.body.imageUrl.trim();
    }

    const category = await Category.create({
      name,
      slug,
      image,
      isMain: isMain === 'true' || isMain === true
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name, isMain } = req.body;
    const slug = name ? name.toLowerCase().replace(/\s+/g, "-") : undefined;

    const updateData = {
      name,
      slug,
      isMain: isMain === 'true' || isMain === true
    };

    if (req.file) {
      // New image uploaded — extract URL from Cloudinary response
      updateData.image =
        req.file.secure_url ||
        req.file.path ||
        req.file.url ||
        null;
    } else if (req.body.imageUrl && typeof req.body.imageUrl === 'string' && req.body.imageUrl.trim()) {
      // Existing URL passed from frontend (no new upload)
      updateData.image = req.body.imageUrl.trim();
    }
    // Otherwise: no image change — don't touch the image field in DB

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};