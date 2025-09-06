import React from "react";

interface AdBannerProps {
  title: string;
  description: string;
  imageUrl?: string;
  ctaText: string;
  ctaLink: string;
  backgroundColor?: string;
  textColor?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  title,
  description,
  imageUrl,
  ctaText,
  ctaLink,
  backgroundColor = "bg-gradient-to-r from-indigo-600 to-purple-600",
  textColor = "text-white"
}) => {
  const getBackgroundStyle = () => {
    if (imageUrl) {
      return {
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    return {};
  };

  return (
    <div 
      className={`relative overflow-hidden rounded-xl shadow-lg min-h-[250px] ${imageUrl ? '' : backgroundColor}`}
      style={getBackgroundStyle()}
    >
      
      <div className="relative px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 ${textColor} leading-tight`}>
            {title}
          </h2>
          <p className={`text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 ${textColor} opacity-90 max-w-2xl mx-auto leading-relaxed`}>
            {description}
          </p>
          <a
            href={ctaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base"
          >
            {ctaText}
            <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};
