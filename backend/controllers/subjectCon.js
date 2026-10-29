const subjectModel = require("../models/subjectModel");

// creating subject

exports.createSubject = async (req, res) => {
  try {
    const newSubject = await subjectModel.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        subject: newSubject,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

//get all subjects

exports.getAllSubjects = async (req, res) => {
  try {
    //1) filtering
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    // remove excludeFields from queryObj
    excludeFields.forEach((el) => delete queryObj[el]);

    //advanced filtering

    // JSON.stringify() converts object into string
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // build query
    let query = subjectModel.find(JSON.parse(queryStr));

    //2) sorting
    if (req.query.sort) {
      //split means split based on a comma and then join means join based on a space
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("name");
    }

    //3) field selection
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      // here we exclude the updateAt field from the response by using -updateAt
      query = query.select("-updateAt");
    }

    //4) pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const subjectCount = await subjectModel.countDocuments(
        JSON.parse(queryStr),
      );

      if (subjectCount > 0 && skip >= subjectCount)
        throw new Error("This page does not exist");
    }

    const allSubjects = await query;
    res.status(200).json({
      status: "success",
      data: {
        allSubjects,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

//get one subject

exports.getOneSubject = async (req, res) => {
  try {
    const oneSubject = await subjectModel.findById(req.params.id);
    // subjectModel.findOne({_id: req.params.id}) is same to findById
    res.status(200).json({
      status: "success",
      data: {
        oneSubject,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

// update subject
exports.updateSubject = async (req, res) => {
  try {
    const updatedSubject = await subjectModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        returnDocument: "after",
        runValidators: true,
      },
    );
    res.status(200).json({
      status: "success",
      data: {
        updatedSubject,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// delete subject

exports.deleteSubject = async (req, res) => {
  try {
    await subjectModel.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "Subject deleted successfully",
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getSubjectStats = async (req, res) => {
  try {
    const stats = await subjectModel.aggregate([
      {
        $match: {
          creditHours: { $gte: 1 },
        },
      },
      {
        $group: {
          _id: "$creditHours",
          totalSubjects: { $sum: 1 },
          // Push each subject's name into the array
          subjectNames: { $push: "$name" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.status(200).json({
      status: "success",
      results: stats.length,
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
