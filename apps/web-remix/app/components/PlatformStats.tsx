import React from "react";
import { AnimatedCounter } from "./AnimatedCounter";

interface StatItem {
  value: string;
  label: string;
  icon: string;
  color: string;
}

interface PlatformStatsProps {
  stats: StatItem[];
}

export const PlatformStats: React.FC<PlatformStatsProps> = ({ stats }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
        Статистика платформы
      </h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="text-center hover:scale-105 transition-transform duration-300"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${stat.color} mb-4 hover:shadow-lg transition-shadow duration-300`}>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              <AnimatedCounter 
                value={stat.value} 
                duration={1500}
                className="inline-block"
              />
            </div>
            <div className="text-sm text-gray-600 font-medium">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
