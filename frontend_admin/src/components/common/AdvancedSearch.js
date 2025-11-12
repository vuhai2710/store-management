import React, { useState } from "react";
import { Form, Input, Select, DatePicker, Button, Space, Card, Row, Col } from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;

/**
 * AdvancedSearch Component
 * Provides advanced search functionality with multiple filters
 * 
 * @param {Object} props
 * @param {Array} props.filters - Array of filter configurations
 * @param {Function} props.onSearch - Callback when search is triggered
 * @param {Function} props.onReset - Callback when reset is triggered
 * @param {Object} props.initialValues - Initial filter values
 */
const AdvancedSearch = ({
  filters = [],
  onSearch,
  onReset,
  initialValues = {},
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [expanded, setExpanded] = useState(false);

  const handleSearch = (values) => {
    // Convert date range to ISO strings
    const processedValues = { ...values };
    Object.keys(processedValues).forEach((key) => {
      if (dayjs.isDayjs(processedValues[key])) {
        processedValues[key] = processedValues[key].toISOString();
      } else if (
        Array.isArray(processedValues[key]) &&
        processedValues[key].length === 2 &&
        dayjs.isDayjs(processedValues[key][0])
      ) {
        processedValues[key] = [
          processedValues[key][0].startOf("day").toISOString(),
          processedValues[key][1].endOf("day").toISOString(),
        ];
      }
    });
    onSearch && onSearch(processedValues);
  };

  const handleReset = () => {
    form.resetFields();
    onReset && onReset();
  };

  const renderFilter = (filter) => {
    const { type, name, label, placeholder, options, ...props } = filter;

    switch (type) {
      case "input":
        return (
          <Form.Item key={name} name={name} label={label}>
            <Input placeholder={placeholder || `Nhập ${label}`} {...props} />
          </Form.Item>
        );
      case "select":
        return (
          <Form.Item key={name} name={name} label={label}>
            <Select placeholder={placeholder || `Chọn ${label}`} allowClear {...props}>
              {options &&
                options.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        );
      case "date":
        return (
          <Form.Item key={name} name={name} label={label}>
            <DatePicker
              placeholder={placeholder || `Chọn ${label}`}
              style={{ width: "100%" }}
              {...props}
            />
          </Form.Item>
        );
      case "dateRange":
        return (
          <Form.Item key={name} name={name} label={label}>
            <RangePicker
              placeholder={[placeholder || "Từ ngày", "Đến ngày"]}
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              {...props}
            />
          </Form.Item>
        );
      case "number":
        return (
          <Form.Item key={name} name={name} label={label}>
            <Input
              type="number"
              placeholder={placeholder || `Nhập ${label}`}
              {...props}
            />
          </Form.Item>
        );
      default:
        return null;
    }
  };

  // Show first 3 filters by default, rest when expanded
  const visibleFilters = expanded ? filters : filters.slice(0, 3);
  const hasMoreFilters = filters.length > 3;

  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSearch}
        initialValues={initialValues}
      >
        <Row gutter={16}>
          {visibleFilters.map((filter) => (
            <Col key={filter.name} xs={24} sm={12} md={8} lg={6}>
              {renderFilter(filter)}
            </Col>
          ))}
          {hasMoreFilters && (
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label=" ">
                <Button
                  type="link"
                  onClick={() => setExpanded(!expanded)}
                  style={{ padding: 0 }}
                >
                  {expanded ? "Thu gọn" : "Mở rộng"}
                </Button>
              </Form.Item>
            </Col>
          )}
        </Row>
        <Row>
          <Col span={24}>
            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SearchOutlined />}
                  loading={loading}
                >
                  Tìm kiếm
                </Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                  Đặt lại
                </Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default AdvancedSearch;


