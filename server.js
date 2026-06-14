const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/summarize", async (req, res) => {
    const { eligibilityText, eligibility } = req.body;

    const text = (eligibilityText || eligibility || "").toLowerCase();

    let summary = [];
    let score = 100;

    if (text.includes("type 2 diabetes")) {
        summary.push("• This study is for people with Type 2 Diabetes.");
    }

    if (text.includes("bmi")) {
        summary.push("• BMI is part of the eligibility rules.");
        score -= 10;
    }

    if (text.includes("age")) {
        summary.push("• There may be an age requirement.");
        score -= 10;
    }

    if (text.includes("insulin")) {
        summary.push("• People using insulin may need to check carefully before applying.");
        score -= 20;
    }

    if (text.includes("semaglutide") || text.includes("tirzepatide")) {
        summary.push("• This study may involve diabetes medications such as semaglutide or tirzepatide.");
        score -= 10;
    }

    if (text.includes("cardiovascular")) {
        summary.push("• Heart or cardiovascular history may affect eligibility.");
        score -= 20;
    }

    summary.push("• Confirm eligibility with the trial team or your doctor.");

    res.json({
        score: score,
        summary: summary.join("\n")
    });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});