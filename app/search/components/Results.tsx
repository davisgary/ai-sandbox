// @ts-ignore
import Slider from 'react-slick';
import React from 'react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

type ResultItem = {
  title: string;
  link: string;
  snippet: string;
  image: string;
};

type ResultsProps = {
  results: ResultItem[];
};

const Results: React.FC<ResultsProps> = ({ results }) => {
  const filteredResults = results.filter((result) => result.image);

  if (!filteredResults.length) return null;

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: '40px',
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          centerPadding: '30px',
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          centerPadding: '20px',
        },
      },
    ],
  };

  return (
    <div className="mt-5 text-left overflow-hidden">
      <Slider {...settings}>
        {filteredResults.map((result, index) => (
          <div key={index} className="px-2">
            <div
              className="bg-white rounded-lg shadow-[0_0_4px_rgba(255,255,255,0.5)] overflow-hidden transition-transform transform hover:scale-105"
              style={{ height: '200px', display: 'flex', flexDirection: 'column' }}>
              <a href={result.link} target="_blank" rel="noopener noreferrer" className="block h-full">
                <div style={{ height: '120px', overflow: 'hidden' }}>
                  <img src={result.image} alt={result.title} className="w-full h-full object-cover shadow-[0_0_4px_rgba(0,0,0,0.3)]" />
                </div>
                <div className="p-2">
                  <h4 className="text-black font-bold mb-1" style={{ fontSize: '14px', lineHeight: '1.2' }}>
                    {result.title}
                  </h4>
                  <p className="text-xs text-black">{result.snippet}</p>
                </div>
              </a>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Results;