require("dotenv").config();
const Server = require("./models/server");

const server = new Server();
server.listen();
// const TOT = require("./helpers/tot");
// const main = async (promt, K) => {
//   const tot = new TOT(promt, K);
//   const result = await tot.getSolution();
//   tot.generateToT();
//   // console.table(result);
// };
// const prompt =
//   "Use 4 numbers and basic arithmetic operations (+-*/) to obtain 24 in one equation, numbers: 24,3,1,10,4";
// const K = 15;
// main(prompt, K);
