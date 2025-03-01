const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Brand required"],
      unique: [true, "Brand must be unique"],
      minlength: [3, "Too short Brand name"],
      maxlength: [32, "too long Brand name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },
  { timestamps: true }
);

const setImageURL = (doc) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/brands/${doc.image}`;
    doc.image = imageUrl;
  }
};
// findOne,findAll,update
brandSchema.post("init", (doc) => {
  setImageURL(doc);
});
brandSchema.post("save", (doc) => {
  // return image base url + image name
  setImageURL(doc);
});

const BrandModel = mongoose.model("Brand", brandSchema);

module.exports = BrandModel;
