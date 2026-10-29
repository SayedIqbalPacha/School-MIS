const mongoose = require("mongoose");
const slugify = require("slugify");

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, "Subject must have a name"],
      trim: true,
    },
    creditHours: {
      type: Number,
      required: [true, "Subject must have credit hours"],
      min: [1, "creadit hours must be at least one credit"],
      max: [16, "creadit hours can not be more than sixteen characters"],
    },
    fessPrice: {
      type: Number,
    },
    fessDiscount: {
      type: Number,
      // this validator only work on current docs like in create() and save() methods
      validate: {
        validator: function (value) {
          return value < this.fessPrice; // return only true or false
        },
        message: " ({VALUE})discount must be less than the actual price ",
      },
    },
    slug: {
      type: String,
    },
    mainSubject: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// virtual property to calculate the total number of characters in the subject name
subjectSchema.virtual("nameLength").get(function () {
  return this.name.length;
});

//  MIDDLEWARES
// 1. documnet middleware
// pre middleware run before saving and it only work on create() and save()
subjectSchema.pre("save", function () {
  this.slug = slugify(this.name, {
    lower: true,
    strict: true,
  });
});

//2. query middleware runs before query execution
subjectModel.pre(/^find/, function () {
  this.start = Date.now();
  console.log("the query is starting");
});

// this runs runs after query execution
subjectModel.post(/^find/, function (docs) {
  const duration = Date.now() - this.start;
  console.log(`the query take ${duration} milliseconds`);
  console.log("query result:", docs);
});

// 3. aggregation middleware runs before an aggregation runs
subjectModel.pre("aggregate", function () {
  this.pipeline().unshift({
    $match: {
      mainSubject: { $ne: false },
    },
  });
  console.log(this.pipeline());
});
const subjectModel = mongoose.model("subject", subjectSchema);

module.exports = subjectModel;
