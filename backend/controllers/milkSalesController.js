/**
 * Milk Sales Controller
 * Handles milk sale CRUD operations and statistics
 */

const MilkSale = require('../models/MilkSale');
const Buyer = require('../models/Buyer');

/**
 * Create a new milk sale
 * POST /api/milk-sales
 */
exports.createMilkSale = async (req, res) => {
  try {
    const {
      farmerId,
      buyerId,
      quantity,
      pricePerLiter,
      quality,
      fatContent,
      sno,
      saleDate,
      paymentMethod,
      paymentStatus,
      notes,
      isDelivered,
      deliveryNotes,
    } = req.body;

    // Validate required fields
    if (!farmerId || !buyerId || !quantity || !pricePerLiter) {
      return res.status(400).json({
        success: false,
        error: 'farmerId, buyerId, quantity, and pricePerLiter are required',
      });
    }

    // Create milk sale
    const milkSale = new MilkSale({
      farmerId,
      buyerId,
      quantity,
      pricePerLiter,
      quality: quality || '',
      fatContent,
      sno,
      saleDate: saleDate || new Date(),
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: paymentStatus || 'pending',
      notes: notes || '',
      isDelivered: isDelivered !== false,
      deliveryNotes: deliveryNotes || '',
    });

    await milkSale.save();

    // Update buyer statistics
    await Buyer.findByIdAndUpdate(buyerId, {
      $inc: {
        totalTransactions: 1,
        totalQuantitySold: quantity,
        totalRevenue: milkSale.totalPrice,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Milk sale created successfully',
      data: milkSale,
    });
  } catch (error) {
    console.error('Error creating milk sale:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to create milk sale',
      details: error.message,
    });
  }
};

/**
 * Get all milk sales with filters
 * GET /api/milk-sales?farmerId=X&buyerId=Y&status=paid&sort=-saleDate
 */
exports.getMilkSales = async (req, res) => {
  try {
    const {
      farmerId,
      buyerId,
      paymentStatus,
      startDate,
      endDate,
      quality,
      sort = '-saleDate',
      limit = 50,
      skip = 0,
    } = req.query;

    // Build filter
    const filter = {};

    if (farmerId) filter.farmerId = farmerId;
    if (buyerId) filter.buyerId = buyerId;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (quality) filter.quality = quality;

    // Date range filter
    if (startDate || endDate) {
      filter.saleDate = {};
      if (startDate) filter.saleDate.$gte = new Date(startDate);
      if (endDate) filter.saleDate.$lte = new Date(endDate);
    }

    // Query
    const sales = await MilkSale.find(filter)
      .populate('buyerId', 'name phoneNumber')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .exec();

    // Get total count
    const total = await MilkSale.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: sales,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip),
    });
  } catch (error) {
    console.error('Error fetching milk sales:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to fetch milk sales',
      details: error.message,
    });
  }
};

/**
 * Get a single milk sale by ID
 * GET /api/milk-sales/:id
 */
exports.getMilkSaleById = async (req, res) => {
  try {
    const { id } = req.params;

    const milkSale = await MilkSale.findById(id).populate('buyerId');

    if (!milkSale) {
      return res.status(404).json({
        success: false,
        error: 'Milk sale not found',
      });
    }

    res.status(200).json({
      success: true,
      data: milkSale,
    });
  } catch (error) {
    console.error('Error fetching milk sale:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to fetch milk sale',
      details: error.message,
    });
  }
};

/**
 * Update a milk sale
 * PATCH /api/milk-sales/:id
 */
exports.updateMilkSale = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow farmerId to be changed
    delete updates.farmerId;

    const milkSale = await MilkSale.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate('buyerId');

    if (!milkSale) {
      return res.status(404).json({
        success: false,
        error: 'Milk sale not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Milk sale updated successfully',
      data: milkSale,
    });
  } catch (error) {
    console.error('Error updating milk sale:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to update milk sale',
      details: error.message,
    });
  }
};

/**
 * Delete a milk sale
 * DELETE /api/milk-sales/:id
 */
exports.deleteMilkSale = async (req, res) => {
  try {
    const { id } = req.params;

    const milkSale = await MilkSale.findByIdAndDelete(id);

    if (!milkSale) {
      return res.status(404).json({
        success: false,
        error: 'Milk sale not found',
      });
    }

    // Update buyer statistics
    if (milkSale.buyerId) {
      await Buyer.findByIdAndUpdate(milkSale.buyerId, {
        $inc: {
          totalTransactions: -1,
          totalQuantitySold: -milkSale.quantity,
          totalRevenue: -milkSale.totalPrice,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Milk sale deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting milk sale:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to delete milk sale',
      details: error.message,
    });
  }
};

/**
 * Get milk sales statistics
 * GET /api/milk-sales/stats/overview?farmerId=X&startDate=2024-01-01&endDate=2024-01-31
 */
exports.getSalesStats = async (req, res) => {
  try {
    const { farmerId, startDate, endDate, buyerId } = req.query;

    // Build filter
    const filter = {};
    if (farmerId) filter.farmerId = farmerId;
    if (buyerId) filter.buyerId = buyerId;

    if (startDate || endDate) {
      filter.saleDate = {};
      if (startDate) filter.saleDate.$gte = new Date(startDate);
      if (endDate) filter.saleDate.$lte = new Date(endDate);
    }

    // Get all matching sales
    const sales = await MilkSale.find(filter);

    // Calculate statistics
    const stats = {
      totalSales: sales.length,
      totalQuantity: sales.reduce((sum, sale) => sum + sale.quantity, 0),
      totalRevenue: sales.reduce((sum, sale) => sum + sale.totalPrice, 0),
      avgPricePerLiter: 0,
      avgQuantityPerSale: 0,
      paidSales: sales.filter((s) => s.paymentStatus === 'paid').length,
      pendingSales: sales.filter((s) => s.paymentStatus === 'pending').length,
      partialSales: sales.filter((s) => s.paymentStatus === 'partial').length,
      paymentMethods: {},
      qualityDistribution: {},
      topBuyers: [],
      trend: [], // Daily trend for last 30 days
    };

    // Average calculations
    if (sales.length > 0) {
      stats.avgPricePerLiter = stats.totalRevenue / stats.totalQuantity;
      stats.avgQuantityPerSale = stats.totalQuantity / sales.length;
    }

    // Payment methods breakdown
    sales.forEach((sale) => {
      stats.paymentMethods[sale.paymentMethod] =
        (stats.paymentMethods[sale.paymentMethod] || 0) + 1;
    });

    // Quality distribution
    sales.forEach((sale) => {
      const quality = sale.quality || 'Unknown';
      stats.qualityDistribution[quality] =
        (stats.qualityDistribution[quality] || 0) + 1;
    });

    // Top buyers (by revenue)
    const buyerRevenue = {};
    sales.forEach((sale) => {
      const buyerId = sale.buyerId?.toString() || 'unknown';
      buyerRevenue[buyerId] = (buyerRevenue[buyerId] || 0) + sale.totalPrice;
    });

    stats.topBuyers = Object.entries(buyerRevenue)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, revenue]) => ({ buyerId: id, revenue }));

    // Daily trend (last 30 days)
    const dailyData = {};
    sales.forEach((sale) => {
      const date = sale.saleDate.toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = {
          quantity: 0,
          revenue: 0,
          count: 0,
        };
      }
      dailyData[date].quantity += sale.quantity;
      dailyData[date].revenue += sale.totalPrice;
      dailyData[date].count += 1;
    });

    stats.trend = Object.entries(dailyData).map(([date, data]) => ({
      date,
      ...data,
    }));

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error calculating sales stats:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to calculate statistics',
      details: error.message,
    });
  }
};
