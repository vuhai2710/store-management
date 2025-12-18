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
        name: category.categoryName || category.name,
      });
    } else {
      form.resetFields();
    }
  }, [category, form]);

  const handleSubmit = async (values) => {

    const payload = {
      name: values.name?.trim(),
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

      { }

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
