require("dotenv").config();
const { response, request } = require("express");
const TOT = require("../helpers/tot");

const getData = async (req = request, res = response) => {
  const prompt =
    "Use 4 numbers and basic arithmetic operations (+-*/) to obtain 24 in one equation, numbers: 8,3";
  const K = 5;
  try {
    const tot = new TOT(prompt, K);
    const result = await tot.getSolution();
    const three = await tot.generateToT();
    res.status(201).json({
      result,
      three,
    });
  } catch (error) {
    res.status(500).json({
      result: undefined,
      three: undefined,
    });
  }
};

module.exports = {
  getData,
};
