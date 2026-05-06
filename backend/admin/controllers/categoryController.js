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
    let image = "";
    if (req.file) {
      const normalizedPath = req.file.path.replace(/\\/g, "/");
      image = normalizedPath.startsWith("http") ? normalizedPath : (normalizedPath.startsWith("/") ? normalizedPath : "/" + normalizedPath);
    } else if (req.body.imageUrl && typeof req.body.imageUrl === 'string') {
      image = req.body.imageUrl;
    } else if (req.body.image && typeof req.body.image === 'string' && req.body.image !== '[object Object]') {
      image = req.body.image;
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
    console.log(`[CategoryUpdate] Updating ID: ${req.params.id}, Name: ${name}, isMain: ${isMain}`);
    
    const slug = name ? name.toLowerCase().replace(/\s+/g, "-") : undefined;
    
    // Only update fields that are provided
    const updateData = {};
    if (name) updateData.name = name;
    if (slug) updateData.slug = slug;
    if (isMain !== undefined) updateData.isMain = isMain === 'true' || isMain === true;
    
    if (req.file) {
      const normalizedPath = req.file.path.replace(/\\/g, "/");
      updateData.image = normalizedPath.startsWith("http") ? normalizedPath : (normalizedPath.startsWith("/") ? normalizedPath : "/" + normalizedPath);
      console.log(`[CategoryUpdate] New file uploaded: ${updateData.image}`);
    } else if (req.body.imageUrl && typeof req.body.imageUrl === 'string' && req.body.imageUrl.trim() !== '') {
      updateData.image = req.body.imageUrl;
      console.log(`[CategoryUpdate] Image URL provided: ${updateData.image}`);
    } else if (req.body.image && typeof req.body.image === 'string' && req.body.image !== '[object Object]' && req.body.image.trim() !== '') {
      updateData.image = req.body.image;
      console.log(`[CategoryUpdate] Image path provided: ${updateData.image}`);
    }
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    
    console.log(`[CategoryUpdate] Successfully updated category: ${category.name}`);
    res.json({ success: true, data: category });
  } catch (error) {
    console.error(`[CategoryUpdate] Error: ${error.message}`);
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
