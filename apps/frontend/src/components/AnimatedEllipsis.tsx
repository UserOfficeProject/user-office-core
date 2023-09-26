import React, { HTMLProps } from 'react';

/**
 * Adds a loading indicator of three dots "..." to the component.
 */
function AnimatedEllipsis(props: HTMLProps<HTMLSpanElement>) {
  return <span {...props} className="ellipsisAnimation"></span>;
}

export default AnimatedEllipsis;
