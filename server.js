const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");

// تحميل ملف الـ serviceAccount
const serviceAccount = require("./serviceAccountKey.json");

// تهيئة Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mobo-shop-default-rtdb.firebaseio.com"
});

const app = express();
app.use(bodyParser.json());

// نقطة نهاية لإرسال الإشعارات
app.post("/send-notification", async (req, res) => {
  const { receiverToken, title, body } = req.body;

  if (!receiverToken || !title || !body) {
    return res.status(400).json({ error: "البيانات ناقصة" });
  }

  const message = {
    notification: {
      title: title,
      body: body
    },
    token: receiverToken
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("تم إرسال الإشعار:", response);
    res.json({ success: true, id: response });
  } catch (error) {
    console.error("خطأ في الإرسال:", error);
    res.status(500).json({ error: error.message });
  }
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server is running on port " + PORT);
});