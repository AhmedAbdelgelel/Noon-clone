const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id);
    if (!document) {
      return next(new ApiError(`No document found for this id ${id}`, 404));
    }
    // Trigger "remove" event when update document
    await document.deleteOne();
    res.status(204).send();
  });

exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!document) {
      return next(new ApiError(`No document found for this id: ${id}`, 404));
    }
    // Trigger "save" event when update document
    await document.save();
    res.status(200).json({ data: document });
  });

exports.createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const newDocument = await Model.create(req.body);
    res.status(201).json({ data: newDocument });
  });

exports.getOne = (Model, populateOption) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    // Build query
    let query = Model.findById(id);
    if (populateOption) {
      query.populate(populateOption);
    }
    // Execute query
    const document = await query;
    if (!document) {
      return next(new ApiError(`No document found for this id: ${id}`, 404));
    }
    res.status(200).json({ data: document });
  });

exports.getAll = (Model, modelName = "") =>
  asyncHandler(async (req, res) => {
    let filter = {};
    // req.filterObj may be set by previous middleware like createFilterObj
    if (req.filterObj) {
      filter = req.filterObj;
    }
    // Build query
    const documentCounts = await Model.countDocuments();
    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .search(modelName)
      .sort()
      .limitFields()
      .paginate(documentCounts);

    // Execute query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const document = await mongooseQuery;

    res.status(200).json({
      result: document.length,
      paginationResult,
      data: document,
    });
  });
