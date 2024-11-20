import React from 'react';
import clsx from 'clsx';

const TextColor = ({ color, className, children }) => (
  <span style={color ? { color } : {}} className={clsx(className)}>
    {children}
  </span>
);

export default TextColor;
