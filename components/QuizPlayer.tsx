'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ListItemIcon from '@mui/material/ListItemIcon';

type QuizQuestion = { question: string; options: string[]; correctAnswer: string; };
type Quiz = QuizQuestion[];

export default function QuizPlayer({ quiz }: { quiz: Quiz }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [userAnswers, setUserAnswers] = React.useState<{[key: number]: string}>({});
  const [showScore, setShowScore] = React.useState(false);
  const [score, setScore] = React.useState(0);

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestionIndex]: event.target.value,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = () => {
    let calculatedScore = 0;
    quiz.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        calculatedScore++;
      }
    });
    setScore(calculatedScore);
    setShowScore(true);
  };

  if (showScore) {
    console.log("Affichage des résultats. Quiz:", quiz, "Réponses utilisateur:", userAnswers);
    return (
      <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
        <Typography variant="h5">Résultat du Quiz</Typography>
        <Typography variant="h6" sx={{ mt: 2 }}>
          Votre score : {score} / {quiz.length}
        </Typography>
        <List sx={{ mt: 2 }}>
          {quiz.map((q, index) => {
            const isCorrect = userAnswers[index] === q.correctAnswer;
            return (
              <ListItem key={index} sx={{ my: 1, border: 1, borderColor: isCorrect ? 'success.main' : 'error.main', borderRadius: 1 }}>
                <ListItemIcon>
                  {isCorrect ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
                </ListItemIcon>
                <ListItemText 
                  primary={q.question}
                  secondary={`Votre réponse : ${userAnswers[index] || 'Aucune'}. Bonne réponse : ${q.correctAnswer}`}
                />
              </ListItem>
            );
          })}
        </List>
        <Button onClick={() => { setShowScore(false); setCurrentQuestionIndex(0); setUserAnswers({}); }} sx={{ mt: 2 }}>
          Recommencer le Quiz
        </Button>
      </Paper>
    );
  }

  const currentQuestion = quiz[currentQuestionIndex];

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Question {currentQuestionIndex + 1} / {quiz.length}</Typography>
      <Typography variant="body1">{currentQuestion.question}</Typography>
      <FormControl sx={{ mt: 2 }}>
        <RadioGroup
          value={userAnswers[currentQuestionIndex] || ''}
          onChange={handleOptionChange}
        >
          {currentQuestion.options.map((option, index) => (
            <FormControlLabel key={index} value={option} control={<Radio />} label={option} />
          ))}
        </RadioGroup>
      </FormControl>
      <Box sx={{ mt: 2 }}>
        {currentQuestionIndex < quiz.length - 1 ? (
          <Button variant="contained" onClick={handleNext}>Suivant</Button>
        ) : (
          <Button variant="contained" color="primary" onClick={handleSubmit}>Terminer le Quiz</Button>
        )}
      </Box>
    </Paper>
  );
}
