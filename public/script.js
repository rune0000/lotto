document.addEventListener("DOMContentLoaded", () => {
  const selected = new Set();
  const maxSelect = 7;
  const grid = document.getElementById("grid");

  for (let i = 1; i <= 37; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = "num";
    btn.onclick = () => {
      if (selected.has(i)) {
        selected.delete(i);
        btn.classList.remove("selected");
      } else {
        if (selected.size >= maxSelect) return alert("7個まで！");
        selected.add(i);
        btn.classList.add("selected");
      }
    };
    grid.appendChild(btn);
  }

  document.getElementById("buyBtn").addEventListener("click", async () => {
    const name = document.getElementById("username").value.trim();
    const numbers = Array.from(selected).sort((a, b) => a - b);

    console.log("送信前データ:", { username: name, numbers });

    if (!name) return alert("ユーザー名を入力してください");
    if (selected.size !== 7) return alert("数字は7個選んでください");

    try {
      const res = await fetch("http://localhost:3000/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: name, numbers })
      });

      const data = await res.json();
      alert(data.message);

      if (data.success) {
        selected.clear();
        document.querySelectorAll(".num").forEach(b => b.classList.remove("selected"));
      }
    } catch (err) {
      console.error(err);
      alert("サーバーに接続できませんでした");
    }
  });

  document.getElementById("resetBtn").addEventListener("click", async () => {
    const pass = document.getElementById("adminPass").value.trim();
    if (!pass) return alert("パスワード入力してね");
    if (!confirm("本当に全履歴を削除しますか？")) return;

    try {
      const res = await fetch("http://localhost:3000/history", {
        method: "DELETE",
        headers: { "admin-pass": pass }
      });
      const data = await res.json();
      alert(data.message);
    } catch (err) {
      console.error(err);
      alert("サーバーに接続できませんでした");
    }
  });
});
