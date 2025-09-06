import React, { useState, useEffect } from "react";

interface AnimatedCounterProps {
  value: string;
  duration?: number;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ 
  value, 
  duration = 1000,
  className = ""
}) => {
  const [displayValue, setDisplayValue] = useState("0");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Проверяем, содержит ли значение число
    const numericValue = parseFloat(value.replace(/[^\d.]/g, ''));
    if (isNaN(numericValue)) {
      setDisplayValue(value);
      return;
    }

    // Анимация только для числовых значений
    const startTime = Date.now();
    const startValue = 0;
    const endValue = numericValue;
    const suffix = value.replace(/[\d.]/g, ''); // Извлекаем суффикс (k, ₽ и т.д.)

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Используем easing функцию для плавной анимации
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easeOutCubic;
      
      // Форматируем число в зависимости от размера
      let formattedValue;
      if (endValue >= 1000) {
        formattedValue = (currentValue / 1000).toFixed(1);
      } else {
        formattedValue = Math.floor(currentValue).toString();
      }
      
      setDisplayValue(formattedValue + suffix);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    // Запускаем анимацию с небольшой задержкой
    const timer = setTimeout(() => {
      setIsVisible(true);
      animate();
    }, 100);

    return () => clearTimeout(timer);
  }, [value, duration]);

  return (
    <div className={`transition-all duration-500 ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'} ${className}`}>
      {displayValue}
    </div>
  );
};
