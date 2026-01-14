import React from "react";

function ProgressBar({
  value = 0,
  max = 100,
  size = "md",
  color = "gray",
  showLabel = false,
  label = "",
  animated = false,
  striped = false,
  className = "",
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeClasses = {
    xs: "h-1",
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
    xl: "h-6",
  };

  const colorClasses = {
    gray: "bg-gray-900",
    blue: "bg-blue-600",
    green: "bg-green-600",
    red: "bg-red-600",
    yellow: "bg-yellow-500",
    purple: "bg-purple-600",
    pink: "bg-pink-600",
  };

  const bgColorClasses = {
    gray: "bg-gray-200",
    blue: "bg-blue-100",
    green: "bg-green-100",
    red: "bg-red-100",
    yellow: "bg-yellow-100",
    purple: "bg-purple-100",
    pink: "bg-pink-100",
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm font-semibold text-gray-900">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div
        className={`w-full ${bgColorClasses[color]} rounded-full overflow-hidden ${sizeClasses[size]}`}
      >
        <div
          className={`h-full ${
            colorClasses[color]
          } rounded-full transition-all duration-500 ease-out ${
            animated ? "animate-pulse" : ""
          } ${striped ? "bg-striped" : ""}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          {striped && (
            <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer"></div>
          )}
        </div>
      </div>
    </div>
  );
}

// Composant pour plusieurs étapes
export function StepProgress({
  currentStep,
  totalSteps,
  steps = [],
  className = "",
}) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <React.Fragment key={index}>
              {/* Étape */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                    isCompleted
                      ? "bg-gray-900 text-white"
                      : isActive
                      ? "bg-gray-900 text-white ring-4 ring-gray-200"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {isCompleted ? "✓" : stepNumber}
                </div>
                <span
                  className={`mt-2 text-xs font-medium transition-colors ${
                    isActive || isCompleted ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {step}
                </span>
              </div>

              {/* Ligne de connexion */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gray-900 transition-all duration-500 ${
                      stepNumber < currentStep ? "w-full" : "w-0"
                    }`}
                  ></div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// Composant circulaire
export function CircularProgress({
  value = 0,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = "gray",
  showLabel = true,
  label = "",
  className = "",
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    gray: "stroke-gray-900",
    blue: "stroke-blue-600",
    green: "stroke-green-600",
    red: "stroke-red-600",
    yellow: "stroke-yellow-500",
    purple: "stroke-purple-600",
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Cercle de fond */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        {/* Cercle de progression */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${colorClasses[color]} transition-all duration-500 ease-out`}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">
            {Math.round(percentage)}%
          </span>
          {label && <span className="text-xs text-gray-500 mt-1">{label}</span>}
        </div>
      )}
    </div>
  );
}

export default ProgressBar;
