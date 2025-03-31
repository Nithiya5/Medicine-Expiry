const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const medicineRoutes = require("./routes/medicineRoutes");

const app = express();


app.use(cors());
app.use(bodyParser.json());
app.set("view engine", "ejs");

mongoose.connect("mongodb+srv://nithiyaprabhar:nithiya2005@cluster0.a02jqzo.mongodb.net/MedicineExpiry", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));

  app.use("/api/user", userRoutes);
  app.use("/api/medicine", medicineRoutes);




const PORT = 7000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});