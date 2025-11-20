import React from "react";
import { Form, Input, Select, DatePicker, InputNumber, Upload, Switch } from "antd";
import { isValidEmail, isValidPhoneNumber, isRequired, minLength, maxLength, isInRange, isPositive, isNonNegative } from "../../utils/validationUtils";
import { formatCurrency, formatDate } from "../../utils/formatUtils";

const { TextArea } = Input;
const { Option } = Select;

/**
 * FormField Component
 * Enhanced form field with validation and error messages
 * 
 * @param {Object} props
 * @param {string} props.type - Field type: 'input' | 'textarea' | 'select' | 'date' | 'number' | 'upload' | 'switch'
 * @param {string} props.name - Field name
 * @param {string} props.label - Field label
 * @param {boolean} props.required - Whether field is required
 * @param {Object} props.validation - Validation rules
 * @param {string} props.placeholder - Placeholder text
 * @param {Array} props.options - Options for select field
 * @param {Object} props.props - Additional props to pass to the field component
 */
const FormField = ({
  type = "input",
  name,
  label,
  required = false,
  validation = {},
  placeholder,
  options = [],
  ...props
}) => {
  const rules = [];

  // Add required rule
  if (required) {
    rules.push({
      required: true,
      message: `Vui lòng nhập ${label || name}`,
    });
  }

  // Add custom validation rules
  if (validation.email) {
    rules.push({
      validator: (_, value) => {
        if (!value || isValidEmail(value)) {
          return Promise.resolve();
        }
        return Promise.reject(new Error("Email không hợp lệ"));
      },
    });
  }

  if (validation.phone) {
    rules.push({
      validator: (_, value) => {
        if (!value || isValidPhoneNumber(value)) {
          return Promise.resolve();
        }
        return Promise.reject(new Error("Số điện thoại không hợp lệ"));
      },
    });
  }

  if (validation.minLength) {
    rules.push({
      min: validation.minLength,
      message: `${label || name} phải có ít nhất ${validation.minLength} ký tự`,
    });
  }

  if (validation.maxLength) {
    rules.push({
      max: validation.maxLength,
      message: `${label || name} không được vượt quá ${validation.maxLength} ký tự`,
    });
  }

  if (validation.min) {
    rules.push({
      validator: (_, value) => {
        if (!value || isInRange(value, validation.min, validation.max || Infinity)) {
          return Promise.resolve();
        }
        return Promise.reject(
          new Error(`${label || name} phải từ ${validation.min}${validation.max ? ` đến ${validation.max}` : ""}`)
        );
      },
    });
  }

  if (validation.positive) {
    rules.push({
      validator: (_, value) => {
        if (!value || isPositive(value)) {
          return Promise.resolve();
        }
        return Promise.reject(new Error(`${label || name} phải là số dương`));
      },
    });
  }

  if (validation.nonNegative) {
    rules.push({
      validator: (_, value) => {
        if (!value || isNonNegative(value)) {
          return Promise.resolve();
        }
        return Promise.reject(new Error(`${label || name} phải là số không âm`));
      },
    });
  }

  // Add custom validator if provided
  if (validation.validator) {
    rules.push({
      validator: validation.validator,
    });
  }

  const renderField = () => {
    switch (type) {
      case "textarea":
        return (
          <TextArea
            placeholder={placeholder || `Nhập ${label || name}`}
            rows={validation.rows || 4}
            showCount={validation.showCount}
            maxLength={validation.maxLength}
            {...props}
          />
        );
      case "select":
        return (
          <Select
            placeholder={placeholder || `Chọn ${label || name}`}
            allowClear
            showSearch={props.showSearch !== false}
            optionFilterProp="children"
            {...props}
          >
            {options.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        );
      case "date":
        return (
          <DatePicker
            placeholder={placeholder || `Chọn ${label || name}`}
            style={{ width: "100%" }}
            format="DD/MM/YYYY"
            {...props}
          />
        );
      case "number":
        return (
          <InputNumber
            placeholder={placeholder || `Nhập ${label || name}`}
            style={{ width: "100%" }}
            min={validation.min}
            max={validation.max}
            formatter={validation.currency ? (value) => formatCurrency(value, "").replace(" ", "") : undefined}
            parser={validation.currency ? (value) => value.replace(/\s/g, "") : undefined}
            {...props}
          />
        );
      case "upload":
        return <Upload {...props} />;
      case "switch":
        return <Switch {...props} />;
      default:
        return (
          <Input
            placeholder={placeholder || `Nhập ${label || name}`}
            {...props}
          />
        );
    }
  };

  return (
    <Form.Item
      name={name}
      label={label}
      rules={rules}
      hasFeedback
      validateTrigger={["onChange", "onBlur"]}
    >
      {renderField()}
    </Form.Item>
  );
};

export default FormField;

