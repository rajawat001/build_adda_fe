import React from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import '../../styles/forms.css';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  required?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  helperText,
  icon,
  required,
  className = '',
  ...props
}) => {
  const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`form-group ${error ? 'has-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && <span className="form-label-required">*</span>}
        </label>
      )}

      <div className="form-input-wrapper">
        {icon && <div className="form-input-icon">{icon}</div>}
        <input
          id={inputId}
          className={`form-input ${icon ? 'has-icon' : ''} ${error ? 'error' : ''}`}
          {...props}
        />
      </div>

      {error && (
        <div className="form-error">
          <FiAlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {!error && helperText && (
        <div className="form-helper-text">{helperText}</div>
      )}
    </div>
  );
};

export default FormInput;
