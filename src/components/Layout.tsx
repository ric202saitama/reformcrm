
import { Helmet } from 'react-helmet';
import { Outlet } from 'react-router-dom'; 

function Layout() {
  return (
    <>
      <Helmet>
        <link rel="icon" type="image/svg+xml" href="/toolbox64flat.png"/> 
      </Helmet>
      <div>         
        <Outlet /> 
      </div>
    </>
  );
}

export default Layout;