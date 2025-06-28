import express from "express";

import {
  createProxyMiddleware,
  responseInterceptor,
} from "http-proxy-middleware"; // Create Express Server
import dotenv from "dotenv";
const app = express();
dotenv.config();
import cors from "cors";
import corsOptions from "./config/corsOptions.js";
import logEvents from "./middleware/logEvents.mjs";
import bodyParser from "body-parser";

const PORT = 3000;
const HOST = "0.0.0.0";

app.use(cors(corsOptions));

app.use((req, res, next) => {
  logEvents(
    `Request from : ${req.headers.origin} requesting : ${req.url}`,
    "events.log"
  );

  next();
});

const signupProxy = createProxyMiddleware({
  target: "http://localhost:3501",
  changeOrigin: true,
  pathRewrite: { "^/": "/signup" },
  selfHandleResponse: true,
  logLevel: "debug",
  on: {
    proxyRes: responseInterceptor(
      async (responseBuffer, proxyRes, req, res) => {
        console.log(" ⭐  proxy Result intercepted ");
        console.log(`🐘 ${JSON.stringify(proxyRes.headers["content-type"])}`);

        if (proxyRes.headers["content-type"].includes("application/json")) {
          const exchange = `[DEBUG] ${req.method} ${req.path} -> ${proxyRes.req.protocol}//${proxyRes.req.host}${proxyRes.req.path} [${proxyRes.statusCode}]`;
          console.log(`▶️ ${exchange}`);
          let response;
          try {
            response = JSON.parse(responseBuffer.toString("utf8"));
            console.log("▶️ Parsed JSON:", response);

          } catch (err) {
            console.log("❌ Failed to parse JSON", err);
          }
        }
        req.signupResponse={responsemssage:response};
        return responseBuffer;

      }
    ),
  },
});
const authenticate=()=>{

}
app.use("/signup", signupProxy,);
app.use("/signup", (req,res,next)=> {
  console.log(`🤤 ${req.signupResponse.responsemssage}`)
});
app.use(
  "/auth",
  createProxyMiddleware({
    target: "http://auth-back:3500",
    changeOrigin: true,
    pathRewrite: (path) => path, // ← this keeps the full path including /auth
    logLevel: "debug",
    onError: (err, req, res) => {
      console.error("Proxy Error:", err);
      res.status(500).send("Proxy Error");
    },
  })
);
// Error Handling
app.use((err, req, res, next) => {
  console.error(`An error occurred: ${err.message}`);
  logEvents(
    `Error ${err.message}, caused by ${err.origin} ${err.stack}`,
    "error.log"
  );

  res.status(500).json({ message: "Internal Server Error" });
});

app.listen(PORT, HOST, () => {
  console.log(`🚀 Starting Proxy at ${HOST}:${PORT}`);
});
