import { useState, useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import Message from './Message';
import axios from 'axios';
import MessageInput from './MessageInput';
import {
  createUser,
  fetchSlots,
  bookAppointment,
  fetchMyAppointments,
  cancelAppointment
} from '../api';

export default function ChatWindow() {
  const [messages, setMessages] = useState([{
    text: 'Welcome! Please enter your name',
    sender: 'bot'
  }]);
  const [step, setStep] = useState(0);
  const [slots, setSlots] = useState([]);
  const [chosenDate, setChosenDate] = useState('');
  const [userInfo, setUserInfo] = useState({ name: '', phone: '' });
  const endRef = useRef(null);
  
  // any time messages change, scroll to the bottom of screen
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // add a message from the bot or user
  const appendBot = text => setMessages(m => [...m, { text, sender: 'bot' }]);
  const appendUser = text => setMessages(m => [...m, { text, sender: 'user' }]);

  const handleSend = async text => {
    appendUser(text); // text contain the message from the user

    if (step === 0) {
      const name = text.trim();
      if (!name) return appendBot('Name cannot be empty. Please enter your name:');
      setUserInfo(ui => ({ ...ui, name }));
      setStep(1);
      return appendBot('Great, now enter your phone number (e.g. 052-1234567):');
    }

    if (step === 1) {
      const phone = text.trim();
      if (!/^\d{2,3}-?\d{6,8}$/.test(phone)) {
        return appendBot('Invalid phone format. Try again (e.g. 052-1234567):');
      }
      try {
        await createUser({ name: userInfo.name, phone });
        setUserInfo(ui => ({ ...ui, phone }));
        setStep(2);
        appendBot(
          `Thanks ${userInfo.name}! What would you like to do?\n` +
          `1) See available slots\n` +
          `2) Book an appointment\n` +
          `3) See my upcoming appointments\n` +
          `4) Cancel an appointment\n` +
          `Type 1, 2, 3, 4 or "exit".`
        );
      } catch (e) {
        appendBot(`Error saving user: ${e.response?.data?.error || e.message}`);
      }
      return;
    }

    if (step === 2) {
      //see available slots
      if (text === '1') {
        let data = await fetchSlots();
        data.sort((a, b) => a.date.localeCompare(b.date));
        data.forEach(s => s.times.sort((a, b) => a.localeCompare(b)));
        if (data.length === 0) {
          return appendBot('No available dates at the moment. Goodbye 👋');
        }
        setSlots(data);
        appendBot(
          'Available slots:\n' +
          data.map(s => `${s.date}: ${s.times.join(', ')}`).join('\n')
        );
        setStep(3);
        return appendBot('Enter date to book (YYYY-MM-DD):');
      }

      // book an appointment
      if (text === '2') {
        setStep(3);
        return appendBot('Enter date to book (YYYY-MM-DD):');
      }
      // see my appointments
      if (text === '3') {
        const appts = await fetchMyAppointments(userInfo.name, userInfo.phone);
        if (appts.length === 0) {
          appendBot('You have no upcoming appointments. 😊');
        } else {
          appendBot(
            'Your appointments:\n' +
            appts.map(a => `${a.date} at ${a.time}`).join('\n')
          );
        }
        return appendBot(
          `Anything else?\n` +
          `1) See slots\n` +
          `2) Book\n` +
          `3) My appointments\n` +
          `4) Cancel\n` +
          `Type "exit" to leave.`
        );
      }
      // cancel an appointment
      if (text === '4') {
        const appts = await fetchMyAppointments(userInfo.name, userInfo.phone);
        if (appts.length === 0) {
          appendBot('You have no appointments to cancel. 😊');
          return appendBot(
            `1) See slots\n` +
            `2) Book\n` +
            `3) My appointments\n` +
            `4) Cancel\n` +
            `Type "exit" to leave.`
          );
        }
        setStep(5);
        appendBot(
          'Your appointments:\n' +
          appts.map((a, i) => `${i + 1}) ${a.date} at ${a.time}`).join('\n')
        );
        return appendBot('Enter the number of the appointment you want to cancel:');
      }
      // exit
      if (text.toLowerCase() === 'exit') {
        return appendBot('Goodbye! 🌸');
      }

      return appendBot('Please type 1, 2, 3, 4 or "exit".');
    }

    if (step === 3) {
      const ok = /^\d{4}-\d{2}-\d{2}$/.test(text);
      if (!ok) return appendBot('Invalid format. Use YYYY-MM-DD.');
      const slot = slots.find(s => s.date === text);
      if (!slot) {
        return appendBot(`Date not available. Choose:\n${slots.map(s => s.date).join(', ')}`);
      }
      setChosenDate(text);
      setStep(4);
      appendBot(`Times on ${text}: ${slot.times.join(', ')}`);
      return appendBot('Enter desired time (HH:MM):');
    }

    if (step === 4) {
      if (!/^\d{2}:\d{2}$/.test(text)) {
        return appendBot('Invalid time. Use HH:MM.');
      }
      try {
        await bookAppointment({
          name: userInfo.name,
          phone: userInfo.phone,
          date: chosenDate,
          time: text
        });
        appendBot(`Booked on ${chosenDate} at ${text} ✅`);
      } catch (e) {
        appendBot(`Error: ${e.response?.data?.error || e.message}`);
      }
      setStep(2);
      return appendBot(
        `Done! What next?\n` +
        `1) See slots\n` +
        `2) Book again\n` +
        `3) My appointments\n` +
        `4) Cancel\n` +
        `Type "exit" to leave.`
      );
    }

    if (step === 5) {
      const index = parseInt(text.trim()) - 1;
      const cleanName = userInfo.name.trim();
      const cleanPhone = userInfo.phone.trim();
      const appts = await fetchMyAppointments(cleanName, cleanPhone);

      if (isNaN(index) || index < 0 || index >= appts.length) {
        return appendBot('Invalid selection. Please enter a valid number from the list.');
      }

      const { date, time } = appts[index];

      try {
        await cancelAppointment({ name: cleanName, phone: cleanPhone, date, time });
        appendBot(`Appointment on ${date} at ${time} canceled ✅`);
      } catch (e) {
        appendBot(`Error canceling: ${e.response?.data?.error || e.message}`);
      }

      setStep(2);
      return appendBot(
        `Anything else?\n` +
        `1) See slots\n` +
        `2) Book again\n` +
        `3) My appointments\n` +
        `4) Cancel\n` +
        `Type "exit" to leave.`
      );
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        zIndex: 2,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.1,
          width: '40%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <img src="/chat-logo.png" alt="Chatbot Logo" style={{ width: '100%' }} />
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          padding: 2,
        }}
      >
        {messages.map((m, i) => (
          <Message key={i} sender={m.sender} text={m.text} />
        ))}
        <div ref={endRef} />
      </Box>

      <Box
        sx={{
          padding: 1,
          backgroundColor: '#fff',
        }}
      >
        <MessageInput onSend={handleSend} />
      </Box>
    </Box>
  );
}
