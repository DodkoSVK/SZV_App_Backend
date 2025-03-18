const express = require("express");
const router = express.Router();
const { getLeague, createLeague, editLeague, removeLeague } = require("../controllers/leagueController");

router.get("/", getLeague);
router.post("/", createLeague);
router.patch("/:id", editLeague);
router.delete("/:id", removeLeague);

module.exports = router;