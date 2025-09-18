import admin from "firebase-admin";

// نمنع إعادة التهيئة إذا السيرفر عمل reload
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FCM_SERVICE_ACCOUNT);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { senderUid, receiverUid, message, token } = req.body;

    if (!token || !message) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const payload = {
      notification: {
        title: `رسالة جديدة من ${senderUid || "مستخدم"}`,
        body: message,
      },
      data: {
        senderUid: senderUid || "",
        receiverUid: receiverUid || "",
      },
      token,
    };

    const response = await admin.messaging().send(payload);

    return res.status(200).json({ success: true, response });
  } catch (error) {
    console.error("FCM Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
