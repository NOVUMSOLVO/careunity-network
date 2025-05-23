/**
 * Security Training Quiz Component
 * 
 * This component displays quiz questions for a security training module.
 */

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { SecurityTrainingQuizQuestion, QuizAnswer } from '@/api/security-training-api';

interface SecurityTrainingQuizProps {
  questions: SecurityTrainingQuizQuestion[];
  answers: QuizAnswer[];
  onAnswerChange: (questionId: number, selectedOption: number) => void;
}

export function SecurityTrainingQuiz({ 
  questions, 
  answers, 
  onAnswerChange 
}: SecurityTrainingQuizProps) {
  // Get the selected option for a question
  const getSelectedOption = (questionId: number): number | undefined => {
    const answer = answers.find(a => a.questionId === questionId);
    return answer?.selectedOption;
  };
  
  return (
    <div className="space-y-6">
      {questions.map((question, index) => (
        <Card key={question.id} className={index > 0 ? 'mt-6' : ''}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {index + 1}. {question.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={getSelectedOption(question.id)?.toString()}
              onValueChange={(value) => onAnswerChange(question.id, parseInt(value))}
            >
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-start space-x-2 mb-3">
                  <RadioGroupItem 
                    value={optionIndex.toString()} 
                    id={`q${question.id}-option${optionIndex}`} 
                    className="mt-1"
                  />
                  <Label 
                    htmlFor={`q${question.id}-option${optionIndex}`}
                    className="font-normal cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
