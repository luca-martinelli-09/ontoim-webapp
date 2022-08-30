const express = require("express");
const { createServer } = require("http");
const axios = require('axios').default;
const bodyParser = require("body-parser");

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'pug');

PORT = process.env.PORT || 3000;
HOME_TITLE = process.env.HOME_TITLE || "Comune di Bugliano"

const httpServer = createServer(app);

const endpointUrl = process.env.SPARQL_ENDPOINT || "http://localhost:8890/sparql"

app.use("/sparql", (req, res) => {
  query = req.query.q || req.body.q;

  queryData = {
    infer: true,
    sameAs: true,
    format: "application/sparql-results+json",
    query: query,
  }

  const queryParams = new URLSearchParams(queryData);

  axios({
    method: "get",
    url: endpointUrl + "?" + queryParams.toString(),
    data: queryData,
    headers: { Accept: "application/sparql-results+json"},
  })
    .then(function (data) {
      res.status(200).json(data.data)
    })
    .catch(function (_) {
      res.status(500).json({ results: null, error: true });
    });
})

app.use("/", (_, res) => {
  res.render("index", { homeTitle: HOME_TITLE });
});

httpServer.listen(PORT);