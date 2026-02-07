/**
 * Buyer Controller
 * Handles buyer/dairy CRUD operations
 */

const Buyer = require('../models/Buyer');

/**
 * Create a new buyer
 * POST /api/buyers
 */
exports.createBuyer = async (req, res) => {
  try {
    const { farmerId, name, type, phoneNumber, email, address, pricePerLiter } = req.body;

    if (!farmerId || !name || !phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'farmerId, name, and phoneNumber are required',
      });
    }

    const buyer = new Buyer({
      farmerId,
      name,
      type: type || 'dairy',
      phoneNumber,
      email: email || '',
      address: address || {},
      pricePerLiter: pricePerLiter || 0,
    });

    await buyer.save();

    res.status(201).json({
      success: true,
      message: 'Buyer created successfully',
      data: buyer,
    });
  } catch (error) {
    console.error('Error creating buyer:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to create buyer',
      details: error.message,
    });
  }
};

/**
 * Get all buyers for a farmer
 * GET /api/buyers?farmerId=X&isActive=true&sort=name
 */
exports.getBuyers = async (req, res) => {
  try {
    const { farmerId, isActive, type, sort = 'name', limit = 50, skip = 0 } = req.query;

    const filter = {};
    if (farmerId) filter.farmerId = farmerId;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (type) filter.type = type;

    const buyers = await Buyer.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .exec();

    const total = await Buyer.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: buyers,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip),
    });
  } catch (error) {
    console.error('Error fetching buyers:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to fetch buyers',
      details: error.message,
    });
  }
};

/**
 * Get a single buyer by ID
 * GET /api/buyers/:id
 */
exports.getBuyerById = async (req, res) => {
  try {
    const { id } = req.params;

    const buyer = await Buyer.findById(id);

    if (!buyer) {
      return res.status(404).json({
        success: false,
        error: 'Buyer not found',
      });
    }

    res.status(200).json({
      success: true,
      data: buyer,
    });
  } catch (error) {
    console.error('Error fetching buyer:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to fetch buyer',
      details: error.message,
    });
  }
};

/**
 * Update a buyer
 * PATCH /api/buyers/:id
 */
exports.updateBuyer = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow farmerId to be changed
    delete updates.farmerId;

    const buyer = await Buyer.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!buyer) {
      return res.status(404).json({
        success: false,
        error: 'Buyer not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Buyer updated successfully',
      data: buyer,
    });
  } catch (error) {
    console.error('Error updating buyer:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to update buyer',
      details: error.message,
    });
  }
};

/**
 * Delete a buyer
 * DELETE /api/buyers/:id
 */
exports.deleteBuyer = async (req, res) => {
  try {
    const { id } = req.params;

    const buyer = await Buyer.findByIdAndDelete(id);

    if (!buyer) {
      return res.status(404).json({
        success: false,
        error: 'Buyer not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Buyer deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting buyer:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to delete buyer',
      details: error.message,
    });
  }
};

/**
 * Add or update review for a buyer
 * POST /api/buyers/:id/review
 */
exports.addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5',
      });
    }

    const buyer = await Buyer.findByIdAndUpdate(
      id,
      {
        $push: {
          reviews: {
            rating,
            comment: comment || '',
            date: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!buyer) {
      return res.status(404).json({
        success: false,
        error: 'Buyer not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Review added successfully',
      data: buyer,
    });
  } catch (error) {
    console.error('Error adding review:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to add review',
      details: error.message,
    });
  }
};

/**
 * Get nearby buyers using geospatial query
 * GET /api/buyers/nearby?latitude=X&longitude=Y&maxDistance=5000 (in meters)
 */
exports.getNearbyBuyers = async (req, res) => {
  try {
    const { farmerId, latitude, longitude, maxDistance = 5000 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'latitude and longitude are required',
      });
    }

    const buyers = await Buyer.find({
      farmerId,
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      },
    }).limit(10);

    res.status(200).json({
      success: true,
      data: buyers,
      count: buyers.length,
    });
  } catch (error) {
    console.error('Error fetching nearby buyers:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to fetch nearby buyers',
      details: error.message,
    });
  }
};
