const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

let purchased = [];
let drawNumbers = [];

const ADMIN_PASS = "8513";
const SHEET_URL = "https://script.google.com/macros/s/AKfycbxSDFMFz5CX-Ox-T41L-Nw84H6y23mn1TXF3dZYz4Z4cRmsJOd7R0XtJqLRMDzjuojVmw/exec";

// 履歴取得
app.get("/history", (req, res) => res.json(purchased));

// 購入
app.post("/submit", async (req, res) => {
  const numbers = req.body.numbers.sort((a, b) => a - b).join(",");
  const username = req.body.username || "ノーネーム";

  const entry = { numbers, username, time: new Date().toLocaleString("ja-JP") };
  purchased.push(entry);

  try {
    // Node.js 18以上ならグローバル fetch を使用
    const response = await fetch(SHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry)
    });
    console.log("GAS送信成功:", entry);
  } catch (err) {
    console.error("GAS送信失敗:", err);
  }

  res.json({ success: true, message: "購入完了！" });
});

// 抽選
function genDraw() {
  let nums = [];
  while (nums.length < 7) {
    let n = Math.floor(Math.random() * 37) + 1;
    if (!nums.includes(n)) nums.push(n);
  }
  return nums.sort((a, b) => a - b);
}

app.get("/draw", (req, res) => {
  if (drawNumbers.length === 0) drawNumbers = genDraw();
  const winners = purchased
    .map(p => {
      const userNums = p.numbers.split(",").map(Number);
      const match = userNums.filter(n => drawNumbers.includes(n)).length;
      return { username: p.username, numbers: p.numbers, match };
    })
    .filter(w => w.match >= 3)
    .sort((a, b) => b.match - a.match);
  res.json({ drawNumbers, winners });
});

// 履歴リセット
app.delete("/history", (req, res) => {
  if (req.headers["admin-pass"] !== ADMIN_PASS) {
    return res.status(403).json({ message: "パスワード違う" });
  }
  purchased = [];
  drawNumbers = [];
  res.json({ message: "履歴リセット完了" });
});

app.listen(PORT, () => console.log("Server → http://localhost:" + PORT));
