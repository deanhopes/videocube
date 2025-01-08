import React from 'react';

const HomePage = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-12 gap-4 items-center py-16">
          {/* Heading and Title (spans 6 columns on medium screens and above) */}
          <div className="col-span-12 md:col-span-6">
            <h1 className="text-4xl font-bold mb-4">Welcome to Our Website</h1>
            <p className="text-xl text-gray-600">
              Discover amazing products and services tailored just for you.
            </p>
          </div>
          {/* Image (spans 6 columns on medium screens and above) */}
          <div className="col-span-12 md:col-span-6">
            <img
              src="/path/to/your/image.jpg"
              alt="Hero image"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
      {/* Add other sections of your homepage here */}
    </div>
  );
};

export default HomePage;
