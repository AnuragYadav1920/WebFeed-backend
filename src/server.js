require("dotenv").config();
const app = require("./app.js");
const port = process.env.PORT || 3000;
const { connectDatabase } = require("./database/blog.database.js");

connectDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`app is listening at port: ${port}`);
    });
  })
  .catch((error) => {
    console.log("Error", error);
  });
