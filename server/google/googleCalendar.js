const { google } = require('googleapis');
const path = require('path');

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];
const KEYFILE = path.join(__dirname, 'credentials.json');

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILE,
  scopes: SCOPES,
});


// new event in Google Calendar
async function createEvent({ name, phone, date, time, calendarId }) {
  const client = await auth.getClient();
  const calendar = google.calendar({ version: 'v3', auth: client });

  const startDateTime = new Date(`${date}T${time}:00`);
  const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000);

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
    calendarId, 
    requestBody: event,
  });

  return res.data;
}

// delete event from Google Calendar by eventId
async function deleteEvent(calendarId, eventId) {
  const client = await auth.getClient();
  const calendar = google.calendar({ version: 'v3', auth: client });

  await calendar.events.delete({
    calendarId,
    eventId,
  });
}


module.exports = {
  createEvent,
  deleteEvent,
};
