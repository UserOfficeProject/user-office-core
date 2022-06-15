import React, { useEffect } from 'react';
import { Route, RouteProps } from 'react-router-dom';

interface PageProps extends RouteProps {
  title: string;
  setHeader: React.Dispatch<React.SetStateAction<string>>;
}

const TitledRoute: React.FC<PageProps> = (props: PageProps) => {
  document.title = props.title;
  // NOTE: useEffect to fix warning about updating component(Dashboard) while rendering another component(TitledRoute)
  useEffect(() => {
    props.setHeader(props.title);
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { title, ...rest } = props;

  return <Route {...rest} />;
};

export default TitledRoute;
