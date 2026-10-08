const express = require("express");
const cors = require("cors");

const registrarRoutes = require("./routes/registrarRoutes");

const app = express();
const PORT = Number(process.env.MOCK_PORT || 3001);

app.use(cors());
app.use(express.json());

const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");

const swaggerDocument = YAML.load(
  path.join(__dirname, "openapi.yaml")
);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/v1", registrarRoutes);

app.use((req, res) => {
  res.status(404)
    .type("application/problem+json")
    .json({
      type: "about:blank",
      title: "Not Found",
      status: 404,
      detail: "The requested endpoint does not exist"
    });
});

app.use((error, req, res, next) => {
  console.error(error);

  res.status(500)
    .type("application/problem+json")
    .json({
      type: "about:blank",
      title: "Internal Server Error",
      status: 500,
      detail: "An unexpected server error occurred"
    });
});

app.listen(PORT, () => {
  console.log(`RegistrarSys Mock API running at http://localhost:${PORT}`);
});
