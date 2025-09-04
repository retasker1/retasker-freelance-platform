import React from 'react';

interface OrderFormProgressProps {
  formData: {
    title: string;
    description: string;
    budget: string;
    category: string;
    deadline: string;
    isUrgent: boolean;
    workType: string;
    tags: string;
  };
  showPreview?: boolean;
}

export function OrderFormProgress({ formData, showPreview = false }: OrderFormProgressProps) {
  // Определяем текущий шаг на основе заполненности полей
  const getCurrentStep = () => {
    if (showPreview) return 4;
    
    let step = 1;
    
    // Шаг 1: Основная информация (название и описание)
    if (formData.title.trim().length >= 5 && formData.description.trim().length >= 20) {
      step = 2;
    }
    
    // Шаг 2: Бюджет и категория
    if (step === 2 && formData.budget && formData.category) {
      step = 3;
    }
    
    // Шаг 3: Дополнительно (дедлайн, приоритет, тип работы, теги)
    if (step === 3) {
      step = 4;
    }
    
    return step;
  };

  const currentStep = getCurrentStep();
  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;
  
  const steps = [
    { number: 1, title: "Основная информация", description: "Название и описание" },
    { number: 2, title: "Бюджет и категория", description: "Стоимость и тип работы" },
    { number: 3, title: "Дополнительно", description: "Сроки и теги" },
    { number: 4, title: "Проверка", description: "Предварительный просмотр" },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">
          Создание заказа
        </h2>
        <span className="text-sm text-gray-500">
          Шаг {currentStep} из {totalSteps}
        </span>
      </div>
      
      {/* Прогресс-бар */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div 
          className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Шаги */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {steps.map((step) => (
          <div
            key={step.number}
            className={`flex items-center space-x-3 p-3 rounded-lg ${
              step.number <= currentStep
                ? 'bg-indigo-50 border border-indigo-200'
                : 'bg-gray-50 border border-gray-200'
            }`}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step.number <= currentStep
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              {step.number < currentStep ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                step.number
              )}
            </div>
            <div className="min-w-0">
              <p className={`text-sm font-medium ${
                step.number <= currentStep ? 'text-indigo-900' : 'text-gray-500'
              }`}>
                {step.title}
              </p>
              <p className={`text-xs ${
                step.number <= currentStep ? 'text-indigo-700' : 'text-gray-400'
              }`}>
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
