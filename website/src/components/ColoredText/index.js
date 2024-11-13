import React from 'react';
import clsx from 'clsx';

const ColoredText = ({ color, className, children }) => (
  <span style={color ? { color } : {}} className={clsx(className)}>
    {children}
  </span>
);

export default ColoredText;
