require("dotenv").config();
const axios = require("axios");

const WEIGHTS = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

function calculateScore(notification) {
  const weight = WEIGHTS[notification.Type] || 0;

  const timestamp = new Date(notification.Timestamp).getTime();

  return {
    ...notification,
    score: weight * 10000000000000 + timestamp,
  };
}

async function getTopNotifications(limit = 10) {
  const response = await axios.get(
    "http://4.224.186.213/evaluation-service/notifications",
    {
      headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      },
    }
  );

  const notifications = response.data.notifications;

  const ranked = notifications
    .map(calculateScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return ranked;
}

(async () => {
  const topNotifications = await getTopNotifications(10);

  console.table(
    topNotifications.map((n) => ({
      type: n.Type,
      message: n.Message,
      timestamp: n.Timestamp,
    }))
  );
})();