const Category = require('../models/Category');

const DEFAULT_CATEGORIES = [
  { name: 'Road Damage', description: 'Potholes, broken roads, damaged pavements, and highway hazards.' },
  { name: 'Waste Management', description: 'Overflowing dumpsters, uncollected trash, illegal dumping, and sanitation issues.' },
  { name: 'Water Leakage', description: 'Burst pipelines, drinking water supply outage, and mains leakage.' },
  { name: 'Streetlight', description: 'Broken street lamps, dark roadway stretches, and exposed wiring.' },
  { name: 'Drainage', description: 'Clogged storm drains, street waterlogging, and sewage overflow.' },
  { name: 'Security', description: 'Park hazards, missing guardrails, broken community security infrastructure.' },
  { name: 'Other', description: 'Miscellaneous community and municipal problem reports.' },
];

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

exports.listCategories = async (req, res, next) => {
  try {
    let categories = await Category.find().sort({ createdAt: 1 });

    if (categories.length === 0) {
      for (const cat of DEFAULT_CATEGORIES) {
        await Category.create({
          name: cat.name,
          slug: slugify(cat.name),
          description: cat.description,
          isDefault: true,
        });
      }
      categories = await Category.find().sort({ createdAt: 1 });
    }

    res.json({
      categories: categories.map((c) => ({
        id: c._id,
        name: c.name,
        slug: c.slug || slugify(c.name),
        description: c.description,
        isDefault: c.isDefault,
        createdAt: c.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const trimmedName = name.trim();
    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
    });

    if (existing) {
      return res.status(409).json({ message: 'A category with this name already exists' });
    }

    const category = await Category.create({
      name: trimmedName,
      slug: slugify(trimmedName),
      description: description?.trim() || '',
      isDefault: false,
    });

    res.status(201).json({
      message: 'Category created successfully',
      category: {
        id: category._id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        isDefault: category.isDefault,
        createdAt: category.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: 'Category name cannot be empty' });
      }
      category.name = name.trim();
      category.slug = slugify(name.trim());
    }

    if (description !== undefined) {
      category.description = description.trim();
    }

    await category.save();

    res.json({
      message: 'Category updated successfully',
      category: {
        id: category._id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        isDefault: category.isDefault,
        createdAt: category.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await Category.findByIdAndDelete(id);

    res.json({
      message: `Category "${category.name}" was successfully deleted`,
      id: category._id,
    });
  } catch (err) {
    next(err);
  }
};

