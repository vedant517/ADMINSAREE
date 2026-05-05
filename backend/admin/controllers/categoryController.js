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
    
    // Support both Cloudinary file upload and direct URL
    const image = req.file ? req.file.path : req.body.image;
    
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
    
    const updateData = { name, slug, isMain: isMain === 'true' || isMain === true };
    
    if (req.file) {
      updateData.image = req.file.path;
    } else if (req.body.image) {
      updateData.image = req.body.image;
    }
    
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
