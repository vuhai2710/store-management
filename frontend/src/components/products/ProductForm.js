import React, { useEffect, useMemo, useState } from "react";
import { Form, Input, InputNumber, Select, Button, Space, Typography, message } from "antd";
import { useDispatch } from "react-redux";
import { createProduct, updateProduct } from "../../store/slices/productsSlice";
import { categoriesService } from "../../services/categoriesService";
import { suppliersService } from "../../services/suppliersService";

const { TextArea } = Input;
const { Text } = Typography;

// const { Option } = Select; // remove for antd v5

const CODE_TYPES = ["SKU", "IMEI", "SERIAL", "BARCODE"];
const STATUSES = ["IN_STOCK", "OUT_OF_STOCK"];

const ProductForm = ({ product, onSuccess }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(false);

  const codeType = Form.useWatch("codeType", form);

  const isProductCodeRequired = useMemo(() => codeType && codeType !== "SKU", [codeType]);

  useEffect(() => {
    const loadMeta = async () => {
      setLoadingMeta(true);
      try {
        const [cats, sups] = await Promise.all([
          categoriesService.getAll(),
          suppliersService.getAllSuppliers(),
        ]);
        // Normalize
        setCategories(Array.isArray(cats?.content) ? cats.content : Array.isArray(cats) ? cats : []);
        const supsData = Array.isArray(sups?.content) ? sups.content : Array.isArray(sups) ? sups : [];
        setSuppliers(supsData);
      } catch {
        // ignore
      } finally {
        setLoadingMeta(false);
      }
    };
    loadMeta();
  }, []);

  useEffect(() => {
    if (product) {
      form.setFieldsValue({
        idCategory: product.idCategory,
        productName: product.productName,
        brand: product.brand,
        idSupplier: product.idSupplier,
        description: product.description,
        price: product.price,
        stockQuantity: product.stockQuantity,
        status: product.status,
        imageUrl: product.imageUrl,
        productCode: product.productCode,
        codeType: product.codeType || "SKU",
        sku: product.sku,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ codeType: "SKU", status: "IN_STOCK", stockQuantity: 0 });
    }
  }, [product, form]);

  const handleSubmit = async (values) => {
    const payload = {
      idCategory: values.idCategory,
      productName: values.productName?.trim(),
      brand: values.brand?.trim() || null,
      idSupplier: values.idSupplier || null,
      description: values.description?.trim() || null,
      price: Number(values.price),
      stockQuantity: values.stockQuantity != null ? Number(values.stockQuantity) : 0,
      status: values.status || null,
      imageUrl: values.imageUrl?.trim() || null,
      productCode: values.productCode?.trim() || null,
      codeType: values.codeType,
      sku: values.sku?.trim() || null,
    };

    try {
      if (product?.idProduct) {
        await dispatch(updateProduct({ id: product.idProduct, data: payload })).unwrap();
        message.success("Cập nhật sản phẩm thành công!");
      } else {
        await dispatch(createProduct(payload)).unwrap();
        message.success("Thêm sản phẩm thành công!");
      }
      onSuccess && onSuccess();
    } catch (e) {
      const errs = e?.errors;
      if (errs && typeof errs === "object") {
        form.setFields(
          Object.entries(errs).map(([name, errMsg]) => ({
            name,
            errors: [String(errMsg)],
          }))
        );
      }
      message.error(e?.message || "Dữ liệu không hợp lệ");
    }
  };

  const categoryOptions = categories.map((c) => ({
    value: c.idCategory,
    label: c.categoryName,
  }));

  const supplierOptions = suppliers.map((s) => ({
    value: s.idSupplier,
    label: s.supplierName,
  }));

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Form.Item
        name="idCategory"
        label="Danh mục"
        rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
      >
        <Select
          placeholder="Chọn danh mục"
          loading={loadingMeta}
          showSearch
          optionFilterProp="label"
          options={categoryOptions}
        />
      </Form.Item>

      <Form.Item
        name="productName"
        label="Tên sản phẩm"
        rules={[
          { required: true, message: "Vui lòng nhập tên sản phẩm" },
          { max: 255, message: "Tối đa 255 ký tự" },
        ]}
      >
        <Input placeholder="Nhập tên sản phẩm" />
      </Form.Item>

      <Form.Item name="brand" label="Thương hiệu">
        <Input placeholder="VD: Apple, Samsung, Dell..." />
      </Form.Item>

      <Form.Item name="idSupplier" label="Nhà cung cấp (optional)">
        <Select
          placeholder="Chọn nhà cung cấp"
          loading={loadingMeta}
          allowClear
          showSearch
          optionFilterProp="label"
          options={supplierOptions}
        />
      </Form.Item>

      <Form.Item name="description" label="Mô tả">
        <TextArea rows={3} placeholder="Mô tả sản phẩm" />
      </Form.Item>

      <Form.Item
        name="price"
        label="Giá"
        rules={[{ required: true, message: "Vui lòng nhập giá" }]}
      >
        <InputNumber min={0} step={1000} style={{ width: "100%" }} placeholder="Nhập giá" />
      </Form.Item>

      <Form.Item name="stockQuantity" label="Tồn kho">
        <InputNumber min={0} step={1} style={{ width: "100%" }} placeholder="Số lượng tồn kho" />
      </Form.Item>

      <Form.Item name="status" label="Trạng thái">
        <Select options={STATUSES.map((st) => ({ value: st, label: st }))} />
      </Form.Item>

      <Form.Item name="imageUrl" label="Ảnh (URL)">
        <Input placeholder="https://..." />
      </Form.Item>

      <Form.Item
        name="codeType"
        label="Loại mã"
        rules={[{ required: true, message: "Vui lòng chọn loại mã" }]}
      >
        <Select options={CODE_TYPES.map((ct) => ({ value: ct, label: ct }))} />
      </Form.Item>

      <Form.Item
        name="productCode"
        label={
          <span>
            Mã sản phẩm{" "}
            <Text type="secondary">
              {codeType === "SKU" ? "(có thể bỏ trống để tự sinh)" : "(bắt buộc)"}
            </Text>
          </span>
        }
        rules={[
          {
            validator: (_, val) => {
              if (isProductCodeRequired && (!val || !String(val).trim())) {
                return Promise.reject(new Error("Vui lòng nhập mã sản phẩm"));
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <Input placeholder={codeType === "SKU" ? "Bỏ trống để tự sinh SKU" : "Nhập mã theo loại đã chọn"} />
      </Form.Item>

      <Form.Item name="sku" label="SKU (optional)">
        <Input placeholder="SKU tùy chọn (nếu dùng song song với mã khác)" />
      </Form.Item>

      <div style={{ textAlign: "right", marginTop: 12 }}>
        <Space>
          <Button onClick={() => onSuccess && onSuccess()}>Hủy</Button>
          <Button type="primary" htmlType="submit">
            {product?.idProduct ? "Cập nhật" : "Thêm"} sản phẩm
          </Button>
        </Space>
      </div>
    </Form>
  );
};

export default ProductForm;


