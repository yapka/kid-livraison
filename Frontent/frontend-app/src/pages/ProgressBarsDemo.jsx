import React, { useState, useEffect } from "react";
import { ArrowLeft, Play, Pause, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProgressBar, {
  StepProgress,
  CircularProgress,
} from "../components/ui/ProgressBar";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

function ProgressBarsDemo() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    let interval;
    if (isRunning && progress < 100) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 1;
          if (next >= 100) {
            setIsRunning(false);
            return 100;
          }
          return next;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isRunning, progress]);

  const handleReset = () => {
    setProgress(0);
    setIsRunning(false);
  };

  const handleStepNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handleStepPrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au tableau de bord
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Progress Bars</h1>
          <p className="text-gray-600 mt-2">
            Collection de barres de progression et indicateurs d'étapes
          </p>
        </div>

        {/* Barres de progression simples */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Barres de progression linéaires
            </h2>

            {/* Contrôles */}
            <div className="flex items-center gap-3 mb-6">
              <Button
                onClick={() => setIsRunning(!isRunning)}
                className="flex items-center gap-2"
              >
                {isRunning ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {isRunning ? "Pause" : "Démarrer"}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Réinitialiser
              </Button>
              <span className="text-sm text-gray-600 ml-4">
                Progression: {progress}%
              </span>
            </div>

            <div className="space-y-6">
              {/* Extra Small */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Extra Small (xs)
                </p>
                <ProgressBar value={progress} size="xs" color="gray" />
              </div>

              {/* Small */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Small (sm)
                </p>
                <ProgressBar value={progress} size="sm" color="gray" />
              </div>

              {/* Medium avec label */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Medium (md) avec label
                </p>
                <ProgressBar
                  value={progress}
                  size="md"
                  color="gray"
                  showLabel
                  label="Téléchargement en cours"
                />
              </div>

              {/* Large */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Large (lg)
                </p>
                <ProgressBar value={progress} size="lg" color="gray" />
              </div>

              {/* Extra Large */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Extra Large (xl)
                </p>
                <ProgressBar value={progress} size="xl" color="gray" />
              </div>
            </div>
          </div>
        </Card>

        {/* Différentes couleurs */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Couleurs disponibles
            </h2>
            <div className="space-y-4">
              <ProgressBar
                value={75}
                color="gray"
                showLabel
                label="Gris (défaut)"
              />
              <ProgressBar value={60} color="blue" showLabel label="Bleu" />
              <ProgressBar value={85} color="green" showLabel label="Vert" />
              <ProgressBar value={30} color="red" showLabel label="Rouge" />
              <ProgressBar value={50} color="yellow" showLabel label="Jaune" />
              <ProgressBar value={70} color="purple" showLabel label="Violet" />
              <ProgressBar value={90} color="pink" showLabel label="Rose" />
            </div>
          </div>
        </Card>

        {/* Progress circulaire */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Progress circulaire
            </h2>
            <div className="flex flex-wrap gap-8 justify-center">
              <CircularProgress
                value={progress}
                size={120}
                color="gray"
                label="Gris"
              />
              <CircularProgress
                value={75}
                size={120}
                color="blue"
                label="Bleu"
              />
              <CircularProgress
                value={60}
                size={120}
                color="green"
                label="Vert"
              />
              <CircularProgress
                value={40}
                size={120}
                color="red"
                label="Rouge"
              />
              <CircularProgress
                value={85}
                size={100}
                strokeWidth={6}
                color="purple"
                label="Violet"
              />
            </div>
          </div>
        </Card>

        {/* Steps Progress */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Progression par étapes
            </h2>

            <StepProgress
              currentStep={currentStep}
              totalSteps={4}
              steps={["Informations", "Adresse", "Validation", "Confirmation"]}
              className="mb-8"
            />

            <div className="flex gap-3 justify-center">
              <Button
                onClick={handleStepPrev}
                disabled={currentStep === 1}
                variant="outline"
              >
                Précédent
              </Button>
              <Button onClick={handleStepNext} disabled={currentStep === 4}>
                Suivant
              </Button>
              <Button
                onClick={() => setCurrentStep(1)}
                variant="outline"
                className="ml-4"
              >
                Réinitialiser
              </Button>
            </div>
          </div>
        </Card>

        {/* Exemples d'utilisation */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Exemples d'utilisation
            </h2>
            <div className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm">
                {`// Import
import ProgressBar from '../components/ui/ProgressBar';
import { StepProgress, CircularProgress } from '../components/ui/ProgressBar';

// Barre simple
<ProgressBar value={60} size="md" color="gray" />

// Avec label
<ProgressBar 
  value={75} 
  showLabel 
  label="Téléchargement" 
  color="blue"
/>

// Progress circulaire
<CircularProgress 
  value={80} 
  size={120} 
  color="green"
  label="Complété"
/>

// Étapes
<StepProgress
  currentStep={2}
  totalSteps={4}
  steps={['Étape 1', 'Étape 2', 'Étape 3', 'Étape 4']}
/>`}
              </pre>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ProgressBarsDemo;
