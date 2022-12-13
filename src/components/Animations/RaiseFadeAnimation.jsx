import React, {useEffect, useState} from 'react';
import {motion} from 'framer-motion';

export default function RaiseFadeAnimation({
  children,
  className,
  delay = 5000,
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setVisible(true);
    }, delay);
  }, []);

  return (
    <motion.div
      className={className}
      variants={{
        show: {
          y: 0,
          opacity: 1,
        },
        hide: {
          y: -30,
          opacity: 0,
        },
      }}
      transition={{
        ease: 'easeOut',
        delay: 0,
        duration: 0.8,
      }}
      initial="hide"
      animate={visible ? 'show' : 'hide'}
    >
      {children}
    </motion.div>
  );
}
