import React, { useEffect } from 'react';
import { RouteProps, useLocation } from 'react-router-dom';

type PageProps = RouteProps & {
  title: string;
  setHeader: React.Dispatch<React.SetStateAction<string>>;
};

const TitledRoute = (props: PageProps) => {
  const location = useLocation();

  useEffect(() => {
    document.title = props.title;
    props.setHeader(props.title);
  }, [location, props]);

  return <>{props.element}</>;
};

export default TitledRoute;
