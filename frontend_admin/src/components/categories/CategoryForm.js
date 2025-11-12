import React, { useEffect } from "react";
import { Form, Input, Button, Space, message } from "antd";
import { useDispatch } from "react-redux";
import { createCategory, updateCategory } from "../../store/slices/categoriesSlice";

const CategoryForm = ({ category, onSuccess }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  useEffect(() => {
    if (category) {
      form.setFieldsValue({
        name: category.categoryName || category.name, // Backend uses categoryName
      });
    } else {
      form.resetFields();
    }
  }, [category, form]);

  const handleSubmit = async (values) => {
    // Backend CategoryDTO expects categoryName (not name) and codePrefix (optional)
    const payload = {
      name: values.name?.trim(), // Will be mapped to categoryName in service
    };

    try {
      if (category?.idCategory) {
        await dispatch(updateCategory({ id: category.idCategory, data: payload })).unwrap();
        message.success("Cập nhật danh mục thành công!");
      } else {
        await dispatch(createCategory(payload)).unwrap();
        message.success("Tạo danh mục thành công!");
      }
      onSuccess && onSuccess();
    } catch (e) {
      // Hiển thị lỗi field từ BE: e.errors = { field: message }
      const fieldErrors = e?.errors;
      if (fieldErrors && typeof fieldErrors === "object") {
        form.setFields(
          Object.entries(fieldErrors).map(([name, errMsg]) => ({
            name,
            errors: [String(errMsg)],
          }))
        );
      }
      message.error(e?.message || "Dữ liệu không hợp lệ");
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Form.Item
        name="name"
        label="Tên danh mục"
        rules={[
          { required: true, message: "Vui lòng nhập tên danh mục" },
          { max: 255, message: "Tối đa 255 ký tự" },
        ]}
      >
        <Input placeholder="Nhập tên danh mục" />
      </Form.Item>

      {/* Note: Backend CategoryDTO doesn't have description field, only categoryName and codePrefix */}

      <div style={{ textAlign: "right", marginTop: 16 }}>
        <Space>
          <Button onClick={() => onSuccess && onSuccess()}>Hủy</Button>
          <Button type="primary" htmlType="submit">
            {category?.idCategory ? "Cập nhật" : "Tạo"} danh mục
          </Button>
        </Space>
      </div>
    </Form>
  );
};

export default CategoryForm;


