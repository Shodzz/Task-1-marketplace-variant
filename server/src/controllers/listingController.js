import Joi from "joi";
import Listing from "../models/Listing.js";

const listingSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().optional(),
  price: Joi.number().min(0).required(),
  category: Joi.string()
    .valid("textbooks", "electronics", "furniture", "clothing", "other")
    .optional(),
  condition: Joi.string().valid("new", "like-new", "used", "worn").optional(),
  status: Joi.string().valid("active", "sold", "removed").optional(),
  seller: Joi.string().optional(),
});

export const createListing = async (req, res) => {
  try {
    const { error } = listingSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const listing = await Listing.create(req.body);

    res.status(201).json(listing);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getAllListings = async (req, res) => {
  try {
    const filter = {};

    if (req.query.includeRemoved !== "true") {
      filter.status = { $ne: "removed" };
    }

    const listings = await Listing.find(filter).populate(
      "seller",
      "name email",
    );

    res.status(200).json(listings);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate(
      "seller",
      "name email",
    );

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    if (listing.status === "removed" && req.query.includeRemoved !== "true") {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    res.status(200).json(listing);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateListing = async (req, res) => {
  try {
    const { error } = listingSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const listing = await Listing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    res.status(200).json(listing);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { status: "removed" },
      { new: true },
    );

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    res.status(200).json({
      message: "Listing removed",
      listing,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const markAsSold = async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { status: "sold" },
      { new: true },
    );

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    res.status(200).json(listing);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
