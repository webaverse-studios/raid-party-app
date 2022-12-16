import React, {useEffect, useState} from 'react';
import {motion} from 'framer-motion';

export default function RaiseFadeAnimation({children, className, delay = 0.5}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setVisible(true);
    }, delay * 1000);
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
        type: 'tween',
        duration: 0.8,
      }}
      initial="hide"
      animate={visible ? 'show' : 'hide'}
    >
      {children}
    </motion.div>
  );
}
