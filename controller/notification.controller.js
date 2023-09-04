const db = require("../helpers/db");
const axios = require('axios');


// Firebase Cloud Messaging server key
const FCM_SERVER_KEY = 'AAAAfFlFoZk:APA91bGu-QLAi5P0F8YyGZ2lTyPEFvdeDUFw0Zwep_-6w0wZJUkZMKlmPVV7B0ALg6DmTU_o-aOdO8jYKazV1i45iL6z265c9sVMZVsjbSHn36liy35gDZsEl9r2ot0HTfRXya8x-Z4E';

// Function to fetch data from the database
async function fetchDataFromDatabase() {
  return new Promise((resolve, reject) => {
    db.query('SELECT f.*, n.user_id, n.token, concat(l.first_name," ",l.last_name) AS lead_name FROM tbl_followup AS f JOIN tbl_notification AS n ON f.user_id = n.user_id JOIN tbl_lead AS l ON f.lead_id = l.id WHERE (NOW() >= f.remainder - INTERVAL 30 MINUTE AND NOW() <= f.remainder) AND f.flag = 0 AND n.flag = 1 AND f.notification_status = 0', (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

// Function to update notification status in the database
async function updateNotificationStatus(userId) {
  return new Promise((resolve, reject) => {
    db.query('UPDATE tbl_followup SET notification_status = 1 WHERE user_id = ?', [userId], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

// Function to send FCM notification
async function sendNotification1(token, message, leadName, userId) {
  const notificationData = {
    to: token,
    "notification": {
      "title": leadName,
      "body": message || "No Description",
      "mutable_content": true,
      "sound": "Tri-tone"
    },

    "data": {
      "url": "<url of media image>",
      "dl": "<deeplink action on tap of notification>"
    }
  };
  const headers = {
    Authorization: `key=${FCM_SERVER_KEY}`,
    'Content-Type': 'application/json'
  };

  try {
    const response = await axios.post('https://fcm.googleapis.com/fcm/send', notificationData, { headers });
    // console.log('Notification sent:', response.data);
    await updateNotificationStatus(userId);

  } catch (error) {
    console.error('Error sending notification:', error);
  }
}


const sendNotification = async  () =>{
  try {
    const data = await fetchDataFromDatabase();

    data.forEach(row => {
      const token = row.token;
      const message = row.description;
      const leadName = row.lead_name;
      const userId = row.user_id;
      sendNotification1(token, message, leadName, userId);
    });
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

module.exports = { sendNotification }