import React, { useEffect } from 'react';
import { Route, RouteProps } from 'react-router-dom';

interface PageProps extends RouteProps {
  title: string;
  setHeader: React.Dispatch<React.SetStateAction<string>>;
}

const Page: React.FC<PageProps> = (props: PageProps) => {
  useEffect(() => {
    document.title = props.title;
    props.setHeader(props.title);
  });

  const { title, ...rest } = props;

  return <Route {...rest} />;
};

export default Page;
