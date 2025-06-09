const { google } = require('googleapis');
const path = require('path');

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];
const KEYFILE = path.join(__dirname, 'google', 'credentials.json');

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILE,
  scopes: SCOPES,
});

const CALENDAR_ID = 'avigaildanesh100@gmail.com';

async function createEvent({ name, phone, date, time }) {
  const client = await auth.getClient();
  const calendar = google.calendar({ version: 'v3', auth: client });

  const startDateTime = new Date(`${date}T${time}:00`);
  const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000); // 30 minutes duration

  const event = {
    summary: `Appointment with ${name}`,
    description: `Phone: ${phone}`,
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: 'Asia/Jerusalem',
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: 'Asia/Jerusalem',
    },
  };

  const res = await calendar.events.insert({
    calendarId: CALENDAR_ID,
    requestBody: event,
  });

  return res.data;
}

async function deleteEvent(eventId) {
  const client = await auth.getClient();
  const calendar = google.calendar({ version: 'v3', auth: client });

  await calendar.events.delete({
    calendarId: CALENDAR_ID,
    eventId,
  });
}

module.exports = {
  createEvent,
  deleteEvent,
};
