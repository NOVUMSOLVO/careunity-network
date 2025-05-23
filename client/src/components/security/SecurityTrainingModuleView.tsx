/**
 * Security Training Module View Component
 * 
 * This component displays a security training module and allows users to complete it.
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useSecurityTrainingModule,
  useUserModuleProgress,
  useQuizQuestions,
  useSubmitQuiz,
  useUpdateUserProgress,
  useCompleteModule
} from '@/hooks/use-security-training';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, 
  Clock, 
  BookOpen, 
  Video, 
  FileText, 
  HelpCircle, 
  MousePointer, 
  CheckCircle, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { QuizAnswer } from '@/api/security-training-api';
import { SecurityTrainingQuiz } from './SecurityTrainingQuiz';

interface SecurityTrainingModuleViewProps {
  moduleId: number;
  onBack: () => void;
}

export function SecurityTrainingModuleView({ 
  moduleId, 
  onBack 
}: SecurityTrainingModuleViewProps) {
  const { t } = useTranslation();
  const [currentProgress, setCurrentProgress] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<{
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    passed: boolean;
  } | null>(null);
  
  // Fetch data
  const { data: module, isLoading: isLoadingModule } = useSecurityTrainingModule(moduleId);
  const { data: progress, isLoading: isLoadingProgress } = useUserModuleProgress(moduleId);
  const { data: questions, isLoading: isLoadingQuestions } = useQuizQuestions(
    module?.type === 'quiz' ? moduleId : 0
  );
  
  // Mutations
  const submitQuiz = useSubmitQuiz();
  const updateProgress = useUpdateUserProgress();
  const completeModule = useCompleteModule();
  
  // Set initial progress
  useEffect(() => {
    if (progress) {
      setCurrentProgress(progress.progress);
    }
  }, [progress]);
  
  // Update progress as user scrolls
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (module?.type === 'quiz') return; // Don't update progress for quizzes based on scroll
    
    const element = e.currentTarget;
    const scrollPosition = element.scrollTop;
    const maxScroll = element.scrollHeight - element.clientHeight;
    
    if (maxScroll > 0) {
      const newProgress = Math.min(
        Math.round((scrollPosition / maxScroll) * 100),
        100
      );
      
      if (newProgress > currentProgress) {
        setCurrentProgress(newProgress);
        
        // Update progress in the backend if it's significantly higher
        if (newProgress >= currentProgress + 10 || newProgress === 100) {
          updateProgress.mutate({
            moduleId,
            progress: {
              progress: newProgress,
              completed: newProgress === 100
            }
          });
        }
      }
    }
  };
  
  // Handle quiz answer selection
  const handleQuizAnswerChange = (questionId: number, selectedOption: number) => {
    const existingAnswerIndex = quizAnswers.findIndex(a => a.questionId === questionId);
    
    if (existingAnswerIndex >= 0) {
      // Update existing answer
      const updatedAnswers = [...quizAnswers];
      updatedAnswers[existingAnswerIndex] = { questionId, selectedOption };
      setQuizAnswers(updatedAnswers);
    } else {
      // Add new answer
      setQuizAnswers([...quizAnswers, { questionId, selectedOption }]);
    }
  };
  
  // Handle quiz submission
  const handleSubmitQuiz = () => {
    if (!questions || questions.length === 0) return;
    
    // Check if all questions are answered
    if (quizAnswers.length < questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }
    
    submitQuiz.mutate(
      { moduleId, answers: quizAnswers },
      {
        onSuccess: (result) => {
          setQuizSubmitted(true);
          setQuizResult(result);
        }
      }
    );
  };
  
  // Handle module completion
  const handleCompleteModule = () => {
    completeModule.mutate({ moduleId });
  };
  
  // Format the estimated duration
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 
      ? `${hours} hr ${remainingMinutes} min` 
      : `${hours} hr`;
  };
  
  // Get the appropriate icon based on module type
  const getModuleTypeIcon = () => {
    if (!module) return <BookOpen className="h-5 w-5" />;
    
    switch (module.type) {
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'article':
        return <FileText className="h-5 w-5" />;
      case 'quiz':
        return <HelpCircle className="h-5 w-5" />;
      case 'interactive':
        return <MousePointer className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };
  
  const isLoading = isLoadingModule || isLoadingProgress || 
    (module?.type === 'quiz' && isLoadingQuestions);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!module) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load the training module. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">{module.title}</h2>
      </div>
      
      <div className="flex items-center mb-4">
        <Badge variant="outline" className="flex items-center mr-3">
          {getModuleTypeIcon()}
          <span className="ml-1">
            {module.type.charAt(0).toUpperCase() + module.type.slice(1)}
          </span>
        </Badge>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-4 w-4 mr-1" />
          <span>{formatDuration(module.estimatedDuration)}</span>
        </div>
        
        {progress?.completed && (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 ml-auto">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )}
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardDescription>{module.description}</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{currentProgress}%</span>
          </div>
          <Progress value={currentProgress} className="h-2" />
        </CardContent>
      </Card>
      
      {module.type === 'quiz' ? (
        <Card>
          <CardHeader>
            <CardTitle>Security Knowledge Quiz</CardTitle>
            <CardDescription>
              Test your knowledge of security best practices by answering the following questions.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {quizSubmitted && quizResult ? (
              <div className="space-y-4">
                <Alert className={quizResult.passed ? 'bg-green-50' : 'bg-red-50'}>
                  {quizResult.passed ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertTitle>
                    {quizResult.passed ? 'Quiz Passed!' : 'Quiz Not Passed'}
                  </AlertTitle>
                  <AlertDescription>
                    You scored {quizResult.score}% ({quizResult.correctAnswers} out of {quizResult.totalQuestions} correct).
                    {!quizResult.passed && ' You need 70% to pass.'}
                  </AlertDescription>
                </Alert>
                
                {quizResult.passed ? (
                  <div className="text-center py-4">
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Congratulations!</h3>
                    <p className="text-muted-foreground mb-4">
                      You have successfully completed this security training module.
                    </p>
                    <Button onClick={onBack}>Return to Training Dashboard</Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">
                      Please review the material and try again.
                    </p>
                    <Button onClick={() => setQuizSubmitted(false)}>Retry Quiz</Button>
                  </div>
                )}
              </div>
            ) : questions && questions.length > 0 ? (
              <SecurityTrainingQuiz
                questions={questions}
                answers={quizAnswers}
                onAnswerChange={handleQuizAnswerChange}
              />
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>No Questions Available</AlertTitle>
                <AlertDescription>
                  There are no quiz questions available for this module.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          
          {!quizSubmitted && questions && questions.length > 0 && (
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={onBack}>Cancel</Button>
              <Button 
                onClick={handleSubmitQuiz}
                disabled={quizAnswers.length < questions.length}
              >
                Submit Quiz
              </Button>
            </CardFooter>
          )}
        </Card>
      ) : (
        <Card>
          <ScrollArea 
            className="h-[60vh]" 
            onScroll={handleScroll}
          >
            <CardContent className="p-6">
              <div dangerouslySetInnerHTML={{ __html: module.content }} />
            </CardContent>
          </ScrollArea>
          
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={onBack}>Back</Button>
            <Button 
              onClick={handleCompleteModule}
              disabled={progress?.completed}
            >
              {progress?.completed ? 'Already Completed' : 'Mark as Completed'}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
