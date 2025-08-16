'use client';
import React, { useState } from 'react';
import { Box, Typography, Button, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { Quiz } from '../types';

interface QuizPlayerProps {
    quiz: Quiz;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({ quiz }) => {
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [showScore, setShowScore] = useState(false);
    const [score, setScore] = useState(0);

    const handleOptionSelect = (questionIndex: number, optionIndex: number) => {
        setSelectedAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
    };

    const handleSubmit = () => {
        let newScore = 0;
        quiz.questions.forEach((q, index) => {
            if (q.correctOptionIndex === selectedAnswers[index]) {
                newScore++;
            }
        });
        setScore(newScore);
        setShowScore(true);
    };

    if (showScore) {
        return (
            <Box>
                <Typography variant="h5">Quiz Terminé !</Typography>
                <Typography variant="h6">Votre score : {score} / {quiz.questions.length}</Typography>
                <Button variant="contained" onClick={() => {
                    setShowScore(false);
                    setSelectedAnswers({});
                    setScore(0);
                }}>Recommencer</Button>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h5" gutterBottom>{quiz.title}</Typography>
            {quiz.questions.map((q, qIndex) => (
                <Box key={qIndex} sx={{ mb: 2 }}>
                    <Typography variant="h6">{q.question}</Typography>
                    <RadioGroup
                        value={selectedAnswers[qIndex] ?? null}
                        onChange={(e) => handleOptionSelect(qIndex, parseInt(e.target.value))}
                    >
                        {q.options.map((option, oIndex) => (
                            <FormControlLabel key={oIndex} value={oIndex} control={<Radio />} label={option} />
                        ))}
                    </RadioGroup>
                </Box>
            ))}
            <Button variant="contained" onClick={handleSubmit}>Soumettre</Button>
        </Box>
    );
};

export default QuizPlayer;
