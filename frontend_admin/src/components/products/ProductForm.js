import React, { useEffect, useMemo, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  Typography,
  message,
  Upload,
  Image,
  Card,
  Divider,
  Tag,
} from "antd";
import { UploadOutlined, DeleteOutlined, StarOutlined, StarFilled, EyeOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { createProduct, updateProduct } from "../../store/slices/productsSlice";
import { categoriesService } from "../../services/categoriesService";
import { suppliersService } from "../../services/suppliersService";
import { productsService } from "../../services/productsService";
import ImageLightbox from "../common/ImageLightbox";
import { getImageUrl } from "../../utils/formatUtils";

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
  const [productImages, setProductImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const codeType = Form.useWatch("codeType", form);
  const isEditing = !!product?.idProduct;

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

  // Load product images when editing
  useEffect(() => {
    if (product?.idProduct) {
      loadProductImages(product.idProduct);
    } else {
      setProductImages([]);
      setFileList([]);
    }
  }, [product?.idProduct]);

  const loadProductImages = async (productId) => {
    try {
      const images = await productsService.getProductImages(productId);
      setProductImages(Array.isArray(images) ? images : []);
    } catch (error) {
      console.error("Error loading product images:", error);
      setProductImages([]);
    }
  };

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
        imageUrl: product.imageUrl, // Keep for backward compatibility
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
      imageUrl: values.imageUrl?.trim() || null, // Keep for backward compatibility
      productCode: values.productCode?.trim() || null,
      codeType: values.codeType,
      sku: values.sku?.trim() || null,
    };

    try {
      let createdOrUpdatedProduct;
      if (product?.idProduct) {
        createdOrUpdatedProduct = await dispatch(updateProduct({ id: product.idProduct, data: payload })).unwrap();
        message.success("Cập nhật sản phẩm thành công!");
      } else {
        createdOrUpdatedProduct = await dispatch(createProduct(payload)).unwrap();
        message.success("Thêm sản phẩm thành công!");
      }

      // Upload images if there are new files (only for new products or when adding new images)
      if (fileList.length > 0 && fileList.some((file) => file.originFileObj)) {
        const productId = createdOrUpdatedProduct?.idProduct || product?.idProduct;
        if (productId) {
          try {
            setUploadingImages(true);
            const filesToUpload = fileList
              .filter((file) => file.originFileObj)
              .map((file) => file.originFileObj);
            if (filesToUpload.length > 0) {
              await productsService.uploadProductImages(productId, filesToUpload);
              message.success("Upload ảnh thành công!");
              // Reload images
              await loadProductImages(productId);
            }
          } catch (error) {
            message.error("Upload ảnh thất bại: " + (error.message || "Lỗi không xác định"));
          } finally {
            setUploadingImages(false);
            setFileList([]);
          }
        }
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

  const handleImageUpload = (info) => {
    const { fileList: newFileList } = info;
    // Limit to 5 images total (existing + new)
    const maxNewFiles = Math.max(0, 5 - productImages.length);
    const filteredFileList = newFileList.slice(0, maxNewFiles);
    setFileList(filteredFileList);
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await productsService.deleteProductImage(imageId);
      message.success("Xóa ảnh thành công!");
      // Reload images
      if (product?.idProduct) {
        await loadProductImages(product.idProduct);
      }
    } catch (error) {
      message.error("Xóa ảnh thất bại: " + (error.message || "Lỗi không xác định"));
    }
  };

  const handleSetPrimaryImage = async (imageId) => {
    try {
      await productsService.setImageAsPrimary(imageId);
      message.success("Đặt ảnh chính thành công!");
      // Reload images
      if (product?.idProduct) {
        await loadProductImages(product.idProduct);
      }
    } catch (error) {
      message.error("Đặt ảnh chính thất bại: " + (error.message || "Lỗi không xác định"));
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

      <Form.Item name="imageUrl" label="Ảnh (URL - tùy chọn, có thể upload ảnh bên dưới)">
        <Input placeholder="https://..." />
      </Form.Item>

      {/* Product Images Section - Only show when editing */}
      {isEditing && product?.idProduct && (
        <>
          <Divider orientation="left">Ảnh sản phẩm</Divider>
          <Form.Item label="Ảnh hiện có">
            {productImages.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                {productImages.map((img) => (
                  <Card
                    key={img.idProductImage}
                    hoverable
                    style={{ width: 150 }}
                    cover={
                      <Image
                        src={getImageUrl(img.imageUrl)}
                        alt="Product"
                        style={{ width: "100%", height: 150, objectFit: "cover" }}
                        preview={true}
                      />
                    }
                    actions={[
                      <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => {
                          setLightboxIndex(productImages.findIndex((i) => i.idProductImage === img.idProductImage));
                          setLightboxVisible(true);
                        }}
                        title="Xem ảnh"
                      />,
                      <Button
                        type="text"
                        icon={img.isPrimary ? <StarFilled style={{ color: "#faad14" }} /> : <StarOutlined />}
                        onClick={() => handleSetPrimaryImage(img.idProductImage)}
                        title={img.isPrimary ? "Ảnh chính" : "Đặt làm ảnh chính"}
                      />,
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteImage(img.idProductImage)}
                        title="Xóa ảnh"
                      />,
                    ]}
                  >
                    {img.isPrimary && (
                      <div style={{ textAlign: "center", marginTop: "8px" }}>
                        <Tag color="gold">Ảnh chính</Tag>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Text type="secondary">Chưa có ảnh</Text>
            )}
          </Form.Item>
          <Form.Item label="Thêm ảnh mới (tối đa 5 ảnh)">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleImageUpload}
              beforeUpload={() => false} // Prevent auto upload
              accept="image/*"
              multiple
              maxCount={Math.max(0, 5 - productImages.length)}
            >
              {fileList.length + productImages.length < 5 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
            <Text type="secondary" style={{ display: "block", marginTop: "8px" }}>
              Có thể upload tối đa 5 ảnh. Ảnh đầu tiên sẽ là ảnh chính.
            </Text>
          </Form.Item>
        </>
      )}

      {/* For new products, show upload */}
      {!isEditing && (
        <>
          <Divider orientation="left">Ảnh sản phẩm (sẽ upload sau khi tạo)</Divider>
          <Form.Item label="Ảnh sẽ được upload sau khi tạo sản phẩm">
            <Text type="secondary">
              Sau khi tạo sản phẩm, bạn có thể quay lại để upload ảnh cho sản phẩm.
            </Text>
          </Form.Item>
        </>
      )}

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

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loadingMeta || uploadingImages}>
            {product?.idProduct ? "Cập nhật" : "Tạo mới"}
          </Button>
          <Button onClick={() => form.resetFields()}>Đặt lại</Button>
        </Space>
      </Form.Item>

      {/* Image Lightbox */}
      <ImageLightbox
        images={productImages.map((img) => ({
          url: getImageUrl(img.imageUrl),
          alt: form.getFieldValue("productName") || "Product",
        }))}
        currentIndex={lightboxIndex}
        visible={lightboxVisible}
        onClose={() => setLightboxVisible(false)}
      />
    </Form>
  );
};

export default ProductForm;


