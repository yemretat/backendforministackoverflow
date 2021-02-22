const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const slugify = require("slugify");
const QuestionSchema = new Schema({
  title: {
    type: String,
    required: [true, "Please provide a title"],
    minlength: [10, "Please providea title at least 10 charachters"],
    unique: true,
  },
  content: {
    type: String,
    required: [true, "Please provide a content"],
    minlength: [20, "Please provide a title at least 20 charachters"],
  },
  slug: String,

  createdAt: {
    type: Date,
    default: Date.now(),
  },
  user: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: "User", // Bu referans olayıyla User modeline bağladık.RDMMS ' lerdeki relationlar gibi
  },
  likes: [
    {
      type: mongoose.Schema.ObjectId, // bizim burada objectIdlerimiz olacak onlar da ref olarak User'ı gösterecek
      ref: "User",
    },
  ],
  answers: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Answer",
    },
  ],
  answerCount: {
    type: Number,
    default: 0,
  },
  likeCount: {
    type: Number,
    default: 0,
  },
});

QuestionSchema.pre("save", function (next) {
  //eğer titke'ımız değiştiyse slug yap
  if (!this.isModified("title")) {
    next();
  }
  this.slug = this.makeSlug();
  console.log("Anan", this.slug);
  next();
});

QuestionSchema.methods.makeSlug = function () {
  return slugify(this.title, {
    replacement: "-",
    remove: /[*+~.()'"!:@]/g,
    lower: true,
  });
};
module.exports = mongoose.model("Question", QuestionSchema);
