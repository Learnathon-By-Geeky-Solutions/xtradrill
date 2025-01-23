import React from 'react';
import PropTypes from 'prop-types';

const Button = ({ onClick, children, variant = 'primary', className = '' }) => {
  const baseStyles = 'px-4 py-2 rounded-md font-medium transition-colors duration-200';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border-2 border-gray-300 hover:bg-gray-100',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'destructive', 'outline']),
  className: PropTypes.string,
};

Button.defaultProps = {
  variant: 'primary',
  className: '',
  onClick: () => {},
};

export default Button;
