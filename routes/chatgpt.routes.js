const { Router } = require("express");
const { getData } = require("../controllers/chatgpt.controller");

const router = Router();

router.get("/", getData);

module.exports = router;
