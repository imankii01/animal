const Session = require('../models/Session');
const Joi = require('joi');

// Validation schema for creating sessions (all fields required)
const sessionValidationSchema = Joi.object({
  start_time: Joi.date().iso().required(),
  end_time: Joi.date().iso().required(),
  duration: Joi.number().integer().min(0).required(),
  milk_quantity: Joi.number().min(0).required(),
});

// Validation schema for updating sessions (all fields optional for partial updates)
const sessionUpdateSchema = Joi.object({
  start_time: Joi.date().iso().optional(),
  end_time: Joi.date().iso().optional(),
  duration: Joi.number().integer().min(0).optional(),
  milk_quantity: Joi.number().min(0).optional(),
});

/**
 * Create a new milking session
 * @route POST /api/sessions
 * @body {start_time, end_time, duration, milk_quantity}
 */
exports.createSession = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = sessionValidationSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(d => d.message),
      });
    }

    // Ensure end_time is after start_time
    if (new Date(value.end_time) <= new Date(value.start_time)) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time',
      });
    }

    // Create new session
    const session = new Session(value);
    await session.save();

    res.status(201).json({
      success: true,
      message: 'Milking session created successfully',
      data: session,
    });
  } catch (error) {
    console.error('Create Session Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create milking session',
      error: error.message,
    });
  }
};

/**
 * Get all milking sessions
 * @route GET /api/sessions
 * @query {sortBy, limit, skip}
 */
exports.getAllSessions = async (req, res) => {
  try {
    const { sortBy = '-created_at', limit = 100, skip = 0 } = req.query;

    const sessions = await Session.find()
      .sort(sortBy)
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Session.countDocuments();

    res.status(200).json({
      success: true,
      message: 'Milking sessions retrieved successfully',
      data: sessions,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: parseInt(skip) + parseInt(limit) < total,
      },
    });
  } catch (error) {
    console.error('Get All Sessions Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve milking sessions',
      error: error.message,
    });
  }
};

/**
 * Get a single milking session by ID
 * @route GET /api/sessions/:id
 */
exports.getSessionById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if ID is a valid MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session ID format. Must be a valid MongoDB ObjectId (24 character hex string)',
        example: '507f1f77bcf86cd799439011',
      });
    }

    const session = await Session.findById(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Milking session not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Milking session retrieved successfully',
      data: session,
    });
  } catch (error) {
    console.error('Get Session By ID Error:', error);
    res.status(400).json({
      success: false,
      message: 'Invalid session ID format',
      error: error.message,
    });
  }
};

/**
 * Update a milking session
 * @route PATCH /api/sessions/:id
 */
exports.updateSession = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate that at least one field is provided
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one field must be provided for update',
        fields: ['start_time', 'end_time', 'duration', 'milk_quantity'],
      });
    }

    // Validate request body using update schema (optional fields)
    const { error, value } = sessionUpdateSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(d => d.message),
      });
    }

    // Ensure end_time is after start_time (if both are provided)
    if (value.start_time && value.end_time) {
      if (new Date(value.end_time) <= new Date(value.start_time)) {
        return res.status(400).json({
          success: false,
          message: 'End time must be after start time',
        });
      }
    }

    const session = await Session.findByIdAndUpdate(id, value, {
      new: true,
      runValidators: true,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Milking session not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Milking session updated successfully',
      data: session,
    });
  } catch (error) {
    console.error('Update Session Error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update milking session',
      error: error.message,
    });
  }
};

/**
 * Delete a milking session
 * @route DELETE /api/sessions/:id
 */
exports.deleteSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await Session.findByIdAndDelete(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Milking session not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Milking session deleted successfully',
      data: session,
    });
  } catch (error) {
    console.error('Delete Session Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete milking session',
      error: error.message,
    });
  }
};

/**
 * Get session statistics
 * @route GET /api/sessions/stats/overview
 */
exports.getSessionStats = async (req, res) => {
  try {
    const stats = await Session.aggregate([
      {
        $group: {
          _id: null,
          total_sessions: { $sum: 1 },
          total_milk_collected: { $sum: '$milk_quantity' },
          average_duration: { $avg: '$duration' },
          average_milk_per_session: { $avg: '$milk_quantity' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: 'Session statistics retrieved successfully',
      data: stats[0] || {
        total_sessions: 0,
        total_milk_collected: 0,
        average_duration: 0,
        average_milk_per_session: 0,
      },
    });
  } catch (error) {
    console.error('Get Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve session statistics',
      error: error.message,
    });
  }
};
