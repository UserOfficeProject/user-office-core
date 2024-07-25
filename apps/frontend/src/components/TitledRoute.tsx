import React, { useEffect, useState } from 'react';
import { RouteProps, useLocation } from 'react-router-dom';

import PageLayout from './PageLayout';

type PageProps = RouteProps & {
  title: string;
};

const TitledRoute = (props: PageProps) => {
  const location = useLocation();
  const [header, setHeader] = useState('User Office');

  useEffect(() => {
    document.title = props.title;
    setHeader(props.title);
  }, [location, props]);

  return <PageLayout header={header}>{props.element}</PageLayout>;
};

export default TitledRoute;
