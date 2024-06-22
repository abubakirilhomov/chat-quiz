const express = require('express');
const socketIo = require('socket.io');
const cors = require('cors');
const { Server } = require('http');

const app = express();

app.use(cors({
  origin: 'https://chat-quiz-front.vercel.app',
  methods: ['GET', 'POST']
}));

const server = new Server(app);

const io = socketIo(server, {
  cors: {
    origin: 'https://chat-quiz-front.vercel.app',
    methods: ['GET', 'POST']
  }
});

const quizQuestions = [
  { question: "What is the capital of Spain?", answer: "Madrid" },
  { question: "What is 2 + 2?", answer: "4" },
  { question: "What is the capital of France?", answer: "Paris" },
  { question: "What is the largest planet?", answer: "Jupiter" },
  { question: "What is the boiling point of water in Celsius?", answer: "100" }
];

io.on('connection', (socket) => {
  console.log(`${socket.id} New user connected`);

  socket.on('disconnect', () => {
    console.log(`${socket.id} Client disconnected`);
  });

  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`Client joined room: ${room}`);
    io.to(room).emit('message', `A new user has joined room ${room}`);
  });

  socket.on('sendChatMessage', (data) => {
    io.to(data.room).emit('receiveChatMessage', data.message);
  });

  socket.on('sendQuizAnswer', (data) => {
    const { room, question, answer } = data;
    const questionData = quizQuestions.find(q => q.question === question);
    let result = 'Incorrect';
    if (questionData && questionData.answer.toLowerCase() === answer.toLowerCase()) {
      result = 'Correct';
    }
    const responseMessage = `Question: ${question}, Answer: ${answer} - ${result}`;
    io.to(room).emit('receiveQuizAnswer', responseMessage);
    console.log(`Broadcasting answer to room ${room}: ${responseMessage}`);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
