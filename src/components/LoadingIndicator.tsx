import { useState } from 'react';

function LoadingIndicator() {
  const [isLoading] = useState(false);


  return (
    <div className={`loading-indicator ${isLoading ? 'show' : ''}`}>
      <img src="loadblue.gif" alt="Loading" width="300" height="200" />
    </div>
  );
}

export default LoadingIndicator;