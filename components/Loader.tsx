import React from 'react';

const Loader: React.FC = () => (
  <div className="flex items-center justify-center min-h-[200px] w-full">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600"></div>
  </div>
);

export default Loader;