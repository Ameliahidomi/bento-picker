// ====== Firebase 設定 ======
const firebaseConfig = {
  apiKey: "AIzaSyAbe5ygGPnVmHFXInkft3GakdVt0bfJv1g",
  authDomain: "bentopicker.firebaseapp.com",
  databaseURL: "https://bentopicker-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bentopicker",
  storageBucket: "bentopicker.firebasestorage.app",
  messagingSenderId: "895439797827",
  appId: "1:895439797827:web:e9b2b76d570c04a299def6",
  measurementId: "G-GVN1NXYQVN"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ====== 店家名單 ======
const names = [
  "腐乳豬","一夫","老周燒肉飯","中庄麵館","福園餡餅粥","林家涼麵","花之壽司","冠成涼麵","古早魏","古粱碳烤三明治",
  "江鳥紅","蘑菇咖哩","武村風味便當","大咖咖哩","米之谷海鮮湯飯","東港飯湯","便當爺爺","真心食坊","越錦食堂",
  "今年貴羹","同昌大雞腿","阿昇廚房","大廟口鹽水雞","鳳林山西刀削麵","竹棧複合式","老江紅茶","八兩五骨鴨",
  "寶麗點心廚房","貳伍麵屋","朱麵屋","呷飽飽創意鍋燒","林家水餃","譚老爺北平麵食","大發乾撈麵","傻師傅湯餃",
  "華新牛排","老闆不夠辣"
];

let intervalId = null;
const display = document.getElementById('display');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const tickSound = document.getElementById('tickSound');
const dingSound = document.getElementById('dingSound');

// 初始化資料庫
db.ref("game").once("value").then(snapshot => {
  if (!snapshot.exists()) {
    db.ref("game").set({
      remaining: names,
      current: "",
      status: "stop"
    });
  }
});

// 監聽狀態變化
db.ref("game").on("value", snapshot => {
  const data = snapshot.val();
  if (!data) return;

  display.textContent = data.current || "等待中...";

  if (data.status === "start" && !intervalId) {
    startBtn.disabled = true;
    stopBtn.disabled = false;
    intervalId = setInterval(() => {
      let rname = data.remaining[Math.floor(Math.random() * data.remaining.length)];
      db.ref("game/current").set(rname);
      display.style.transform = "scale(1.2)";
      setTimeout(() => display.style.transform = "scale(1)", 50);
      tickSound.currentTime = 0;
      tickSound.play();
    }, 80);
  } else if (data.status === "stop" && intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    dingSound.currentTime = 0;
    dingSound.play();
  }
});

// 開始按鈕
startBtn.addEventListener("click", () => {
  db.ref("game/status").set("start");
});

// 停止按鈕
stopBtn.addEventListener("click", async () => {
  const snapshot = await db.ref("game").get();
  const data = snapshot.val();
  let chosenName = data.current;
  let newRemaining = data.remaining.filter(n => n !== chosenName);

  if (newRemaining.length === 0) {
    alert("🎉 所有店家都輪過一遍囉！重新開始");
    newRemaining = [...names];
  }
  await db.ref("game").update({
    remaining: newRemaining,
    status: "stop"
  });
});
