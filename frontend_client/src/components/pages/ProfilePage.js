
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
  Lock,
  Plus,
  Trash2,
  Check,
} from "lucide-react";
import styles from "../../styles/styles";
import LoadingSpinner from "../common/LoadingSpinner";
import { customerService } from "../../services/customerService";
import { shippingAddressService } from "../../services/shippingAddressService";
import { userService } from "../../services/userService";
import { ghnService } from "../../services/ghnService";
import { useAuth } from "../../hooks/useAuth";
import { formatPhone, getImageUrl } from "../../utils/formatUtils";

const ProfilePage = ({ setCurrentPage }) => {
  const { customer, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [shippingAddresses, setShippingAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatar, setAvatar] = useState(null);

  const [profileForm, setProfileForm] = useState({
    customerName: "",
    phoneNumber: "",
    address: "",
  });

  const [addressForm, setAddressForm] = useState({
    recipientName: "",
    phoneNumber: "",
    address: "",
    isDefault: false,
    provinceId: null,
    districtId: null,
    wardCode: null,
  });

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const profileData = await customerService.getMyProfile();
        setProfile(profileData);
        setProfileForm({
          customerName: profileData.customerName || "",
          phoneNumber: profileData.phoneNumber || "",
          address: profileData.address || "",
        });

        try {
          const userData = await userService.getMyProfile();
          if (userData?.avatarUrl) {
            setAvatar(userData.avatarUrl);
          }
        } catch (userError) {
          console.error("Error fetching user profile:", userError);

        }

        const addressesData = await shippingAddressService.getAllAddresses();
        setShippingAddresses(addressesData || []);

        try {
          setLoadingProvinces(true);
          const provincesData = await ghnService.getProvinces();
          setProvinces(provincesData || []);
        } catch (ghnError) {
          console.error("Error fetching provinces:", ghnError);

        } finally {
          setLoadingProvinces(false);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setError("Không thể tải thông tin. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (!addressForm.provinceId) {
        setDistricts([]);
        setWards([]);
        return;
      }

      try {
        setLoadingDistricts(true);
        const districtsData = await ghnService.getDistricts(
          addressForm.provinceId
        );
        setDistricts(districtsData || []);
        setWards([]);
        setAddressForm((prev) => ({
          ...prev,
          districtId: null,
          wardCode: null,
        }));
      } catch (error) {
        console.error("Error fetching districts:", error);
        setDistricts([]);
      } finally {
        setLoadingDistricts(false);
      }
    };

    fetchDistricts();
  }, [addressForm.provinceId]);

  useEffect(() => {
    const fetchWards = async () => {
      if (!addressForm.districtId) {
        setWards([]);
        return;
      }

      try {
        setLoadingWards(true);
        const wardsData = await ghnService.getWards(addressForm.districtId);
        setWards(wardsData || []);
        setAddressForm((prev) => ({ ...prev, wardCode: null }));
      } catch (error) {
        console.error("Error fetching wards:", error);
        setWards([]);
      } finally {
        setLoadingWards(false);
      }
    };

    fetchWards();
  }, [addressForm.districtId]);

  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedProfile = await customerService.updateMyProfile(profileForm);
      setProfile(updatedProfile);
      setEditingProfile(false);
      await refreshUser();
      toast.success("Cập nhật thông tin thành công");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(
        error?.message || "Không thể cập nhật thông tin. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const newAddress = await shippingAddressService.createAddress(
        addressForm
      );
      setShippingAddresses([...shippingAddresses, newAddress]);
      setShowAddressForm(false);
      setAddressForm({
        recipientName: "",
        phoneNumber: "",
        address: "",
        isDefault: false,
        provinceId: null,
        districtId: null,
        wardCode: null,
      });
      setDistricts([]);
      setWards([]);
      toast.success("Tạo địa chỉ thành công");
    } catch (error) {
      console.error("Error creating address:", error);
      toast.error(error?.message || "Không thể tạo địa chỉ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAddress = async (addressId) => {
    try {
      setLoading(true);
      const updatedAddress = await shippingAddressService.updateAddress(
        addressId,
        addressForm
      );
      setShippingAddresses(
        shippingAddresses.map((addr) =>
          (addr.idShippingAddress || addr.id) === addressId
            ? updatedAddress
            : addr
        )
      );
      setEditingAddress(null);
      setAddressForm({
        recipientName: "",
        phoneNumber: "",
        address: "",
        isDefault: false,
        provinceId: null,
        districtId: null,
        wardCode: null,
      });
      setDistricts([]);
      setWards([]);
      toast.success("Cập nhật địa chỉ thành công");
    } catch (error) {
      console.error("Error updating address:", error);
      toast.error(
        error?.message || "Không thể cập nhật địa chỉ. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
      return;
    }

    try {
      setLoading(true);
      await shippingAddressService.deleteAddress(addressId);
      setShippingAddresses(
        shippingAddresses.filter(
          (addr) => (addr.idShippingAddress || addr.id) !== addressId
        )
      );
      toast.success("Xóa địa chỉ thành công");
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error(error?.message || "Không thể xóa địa chỉ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      setLoading(true);
      const updatedAddress = await shippingAddressService.setDefaultAddress(
        addressId
      );
      setShippingAddresses(
        shippingAddresses.map((addr) =>
          (addr.idShippingAddress || addr.id) === addressId
            ? { ...addr, isDefault: true }
            : { ...addr, isDefault: false }
        )
      );
      toast.success("Đặt địa chỉ mặc định thành công");
    } catch (error) {
      console.error("Error setting default address:", error);
      toast.error(
        error?.message || "Không thể đặt địa chỉ mặc định. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.warning("Mật khẩu xác nhận không khớp");
      return;
    }

    if (passwordForm.newPassword.length < 4) {
      toast.warning("Mật khẩu mới phải có ít nhất 4 ký tự");
      return;
    }

    try {
      setLoading(true);
      await customerService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setShowPasswordForm(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Đổi mật khẩu thành công");
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(
        error?.message || "Không thể đổi mật khẩu. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.warning("Vui lòng chọn file ảnh");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.warning("File ảnh quá lớn. Vui lòng chọn file nhỏ hơn 5MB");
      return;
    }

    try {
      setAvatarLoading(true);

      const userData = await userService.uploadAvatar(file);

      if (userData?.avatarUrl) {
        setAvatar(userData.avatarUrl);
        await refreshUser();
        toast.success("Upload ảnh đại diện thành công");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error(
        error?.message || "Không thể upload ảnh đại diện. Vui lòng thử lại."
      );
    } finally {
      setAvatarLoading(false);

      e.target.value = "";
    }
  };

  const handleAvatarDelete = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa ảnh đại diện?")) {
      return;
    }

    try {
      setAvatarLoading(true);
      await userService.deleteAvatar();
      setAvatar(null);
      await refreshUser();
      toast.success("Xóa ảnh đại diện thành công");
    } catch (error) {
      console.error("Error deleting avatar:", error);
      toast.error(
        error?.message || "Không thể xóa ảnh đại diện. Vui lòng thử lại."
      );
    } finally {
      setAvatarLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <section style={{ padding: "4rem 0" }}>
        <div style={styles.container}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "50vh",
            }}>
            <LoadingSpinner />
          </div>
        </div>
      </section>
    );
  }

  if (error && !profile) {
    return (
      <section style={{ padding: "4rem 0" }}>
        <div style={styles.container}>
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <p
              style={{
                color: "#dc3545",
                fontSize: "1.125rem",
                marginBottom: "1rem",
              }}>
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={styles.buttonPrimary}>
              Thử lại
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: "4rem 0", backgroundColor: "#F8FAFC" }}>
      <div style={styles.container}>
        <h2
          style={{
            fontSize: "1.875rem",
            fontWeight: "bold",
            marginBottom: "2rem",
          }}>
          Hồ sơ của tôi
        </h2>

        {}
        <div
          style={{
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "0.5rem",
            marginBottom: "2rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
            }}>
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}>
              <User size={24} /> Thông tin cá nhân
            </h3>
            {!editingProfile && (
              <button
                onClick={() => setEditingProfile(true)}
                style={{
                  ...styles.buttonSecondary,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                }}>
                <Edit size={16} /> Chỉnh sửa
              </button>
            )}
          </div>

          {}
          <div
            style={{
              marginBottom: "2rem",
              paddingBottom: "2rem",
              borderBottom: "1px solid #E2E8F0",
            }}>
            <div
              style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    backgroundColor: "#E2E8F0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    border: "3px solid #E2E8F0",
                    flexShrink: 0,
                  }}>
                  {avatar ? (
                    <img
                      src={getImageUrl(avatar)}
                      alt="Avatar"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.innerHTML =
                          '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 3rem;">👤</div>';
                      }}
                    />
                  ) : (
                    <div style={{ fontSize: "3rem", color: "#6c757d" }}>👤</div>
                  )}
                  {avatarLoading && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                      }}>
                      <LoadingSpinner size={30} color="white" />
                    </div>
                  )}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <h4
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "600",
                    marginBottom: "0.5rem",
                    color: "#212529",
                  }}>
                  Ảnh đại diện
                </h4>
                <p
                  style={{
                    color: "#6c757d",
                    fontSize: "0.875rem",
                    marginBottom: "1rem",
                  }}>
                  JPG, PNG hoặc GIF. Tối đa 5MB.
                </p>
                <div
                  style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <label
                    htmlFor="avatar-upload"
                    style={{
                      ...styles.buttonSecondary,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem 1rem",
                      cursor: avatarLoading ? "not-allowed" : "pointer",
                      opacity: avatarLoading ? 0.6 : 1,
                    }}>
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={avatarLoading}
                      style={{ display: "none" }}
                    />
                    <Edit size={16} />
                    {avatar ? "Đổi ảnh" : "Tải ảnh lên"}
                  </label>
                  {avatar && (
                    <button
                      onClick={handleAvatarDelete}
                      disabled={avatarLoading}
                      style={{
                        ...styles.buttonSecondary,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.5rem 1rem",
                        backgroundColor: "#f8d7da",
                        color: "#721c24",
                        border: "1px solid #f5c6cb",
                        cursor: avatarLoading ? "not-allowed" : "pointer",
                        opacity: avatarLoading ? 0.6 : 1,
                      }}>
                      <Trash2 size={16} />
                      Xóa ảnh
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {editingProfile ? (
            <form onSubmit={handleUpdateProfile}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "600",
                      color: "#495057",
                    }}>
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={profileForm.customerName}
                    onChange={handleProfileFormChange}
                    required
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #E2E8F0",
                      borderRadius: "0.25rem",
                      fontSize: "1rem",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "600",
                      color: "#495057",
                    }}>
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={profileForm.phoneNumber}
                    onChange={handleProfileFormChange}
                    required
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #E2E8F0",
                      borderRadius: "0.25rem",
                      fontSize: "1rem",
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "600",
                    color: "#495057",
                  }}>
                  Địa chỉ
                </label>
                <textarea
                  name="address"
                  value={profileForm.address}
                  onChange={handleProfileFormChange}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #E2E8F0",
                    borderRadius: "0.25rem",
                    fontSize: "1rem",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...styles.buttonPrimary,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1.5rem",
                  }}>
                  <Save size={16} /> Lưu
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingProfile(false);
                    setProfileForm({
                      customerName: profile?.customerName || "",
                      phoneNumber: profile?.phoneNumber || "",
                      address: profile?.address || "",
                    });
                  }}
                  style={{
                    ...styles.buttonSecondary,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1.5rem",
                  }}>
                  <X size={16} /> Hủy
                </button>
              </div>
            </form>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}>
              <div>
                <p
                  style={{
                    color: "#6c757d",
                    fontSize: "0.875rem",
                    marginBottom: "0.25rem",
                  }}>
                  Họ và tên
                </p>
                <p
                  style={{
                    fontWeight: "600",
                    color: "#212529",
                    fontSize: "1.125rem",
                  }}>
                  {profile?.customerName || customer?.customerName || "N/A"}
                </p>
              </div>
              <div>
                <p
                  style={{
                    color: "#6c757d",
                    fontSize: "0.875rem",
                    marginBottom: "0.25rem",
                  }}>
                  Số điện thoại
                </p>
                <p
                  style={{
                    fontWeight: "600",
                    color: "#212529",
                    fontSize: "1.125rem",
                  }}>
                  {formatPhone(
                    profile?.phoneNumber || customer?.phoneNumber || "N/A"
                  )}
                </p>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <p
                  style={{
                    color: "#6c757d",
                    fontSize: "0.875rem",
                    marginBottom: "0.25rem",
                  }}>
                  Địa chỉ
                </p>
                <p
                  style={{
                    fontWeight: "600",
                    color: "#212529",
                    fontSize: "1.125rem",
                  }}>
                  {profile?.address || customer?.address || "N/A"}
                </p>
              </div>
              <div>
                <p
                  style={{
                    color: "#6c757d",
                    fontSize: "0.875rem",
                    marginBottom: "0.25rem",
                  }}>
                  Email
                </p>
                <p
                  style={{
                    fontWeight: "600",
                    color: "#212529",
                    fontSize: "1.125rem",
                  }}>
                  {customer?.email || profile?.email || "N/A"}
                </p>
              </div>
              <div>
                <p
                  style={{
                    color: "#6c757d",
                    fontSize: "0.875rem",
                    marginBottom: "0.25rem",
                  }}>
                  Loại khách hàng
                </p>
                <p
                  style={{
                    fontWeight: "600",
                    color: "#212529",
                    fontSize: "1.125rem",
                  }}>
                  {profile?.customerType || customer?.customerType || "REGULAR"}
                </p>
              </div>
            </div>
          )}
        </div>

        {}
        <div
          style={{
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "0.5rem",
            marginBottom: "2rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
            }}>
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}>
              <Lock size={24} /> Đổi mật khẩu
            </h3>
            {!showPasswordForm && (
              <button
                onClick={() => setShowPasswordForm(true)}
                style={{
                  ...styles.buttonSecondary,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                }}>
                <Edit size={16} /> Đổi mật khẩu
              </button>
            )}
          </div>

          {showPasswordForm && (
            <form onSubmit={handleChangePassword}>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "600",
                    color: "#495057",
                  }}>
                  Mật khẩu hiện tại *
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #E2E8F0",
                    borderRadius: "0.25rem",
                    fontSize: "1rem",
                  }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "600",
                    color: "#495057",
                  }}>
                  Mật khẩu mới *
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  required
                  minLength={4}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #E2E8F0",
                    borderRadius: "0.25rem",
                    fontSize: "1rem",
                  }}
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "600",
                    color: "#495057",
                  }}>
                  Xác nhận mật khẩu mới *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  required
                  minLength={4}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #E2E8F0",
                    borderRadius: "0.25rem",
                    fontSize: "1rem",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...styles.buttonPrimary,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1.5rem",
                  }}>
                  <Save size={16} /> Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  style={{
                    ...styles.buttonSecondary,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1.5rem",
                  }}>
                  <X size={16} /> Hủy
                </button>
              </div>
            </form>
          )}
        </div>

        {}
        <div
          style={{
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "0.5rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
            }}>
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}>
              <MapPin size={24} /> Địa chỉ giao hàng
            </h3>
            {!showAddressForm && (
              <button
                onClick={() => setShowAddressForm(true)}
                style={{
                  ...styles.buttonSecondary,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                }}>
                <Plus size={16} /> Thêm địa chỉ
              </button>
            )}
          </div>

          {}
          {showAddressForm && (
            <form
              onSubmit={handleCreateAddress}
              style={{
                marginBottom: "2rem",
                padding: "1.5rem",
                border: "1px solid #E2E8F0",
                borderRadius: "0.5rem",
                backgroundColor: "#F8FAFC",
              }}>
              <h4
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "bold",
                  marginBottom: "1rem",
                }}>
                Địa chỉ giao hàng mới
              </h4>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "600",
                      color: "#495057",
                    }}>
                    Tên người nhận *
                  </label>
                  <input
                    type="text"
                    name="recipientName"
                    value={addressForm.recipientName}
                    onChange={handleAddressFormChange}
                    required
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #E2E8F0",
                      borderRadius: "0.25rem",
                      fontSize: "1rem",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "600",
                      color: "#495057",
                    }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={addressForm.phoneNumber}
                    onChange={handleAddressFormChange}
                    required
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #E2E8F0",
                      borderRadius: "0.25rem",
                      fontSize: "1rem",
                    }}
                  />
                </div>
              </div>

              {}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "600",
                      color: "#495057",
                    }}>
                    Tỉnh/Thành phố *
                  </label>
                  <select
                    name="provinceId"
                    value={addressForm.provinceId || ""}
                    onChange={(e) => {
                      const provinceId = e.target.value
                        ? Number(e.target.value)
                        : null;
                      setAddressForm((prev) => ({
                        ...prev,
                        provinceId,
                        districtId: null,
                        wardCode: null,
                      }));
                    }}
                    required
                    disabled={loadingProvinces}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #E2E8F0",
                      borderRadius: "0.25rem",
                      fontSize: "1rem",
                    }}>
                    <option value="">-- Chọn tỉnh/thành phố --</option>
                    {provinces.map((province) => (
                      <option
                        key={province.provinceId || province.id}
                        value={province.provinceId || province.id}>
                        {province.provinceName || province.name}
                      </option>
                    ))}
                  </select>
                  {loadingProvinces && (
                    <div
                      style={{
                        marginTop: "0.5rem",
                        fontSize: "0.875rem",
                        color: "#6c757d",
                      }}>
                      Đang tải...
                    </div>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "600",
                      color: "#495057",
                    }}>
                    Quận/Huyện *
                  </label>
                  <select
                    name="districtId"
                    value={addressForm.districtId || ""}
                    onChange={(e) => {
                      const districtId = e.target.value
                        ? Number(e.target.value)
                        : null;
                      setAddressForm((prev) => ({
                        ...prev,
                        districtId,
                        wardCode: null,
                      }));
                    }}
                    required
                    disabled={!addressForm.provinceId || loadingDistricts}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #E2E8F0",
                      borderRadius: "0.25rem",
                      fontSize: "1rem",
                      opacity: !addressForm.provinceId ? 0.6 : 1,
                    }}>
                    <option value="">-- Chọn quận/huyện --</option>
                    {districts.map((district) => (
                      <option
                        key={district.districtId || district.id}
                        value={district.districtId || district.id}>
                        {district.districtName || district.name}
                      </option>
                    ))}
                  </select>
                  {loadingDistricts && (
                    <div
                      style={{
                        marginTop: "0.5rem",
                        fontSize: "0.875rem",
                        color: "#6c757d",
                      }}>
                      Đang tải...
                    </div>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "600",
                      color: "#495057",
                    }}>
                    Phường/Xã *
                  </label>
                  <select
                    name="wardCode"
                    value={addressForm.wardCode || ""}
                    onChange={(e) => {
                      setAddressForm((prev) => ({
                        ...prev,
                        wardCode: e.target.value || null,
                      }));
                    }}
                    required
                    disabled={!addressForm.districtId || loadingWards}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #E2E8F0",
                      borderRadius: "0.25rem",
                      fontSize: "1rem",
                      opacity: !addressForm.districtId ? 0.6 : 1,
                    }}>
                    <option value="">-- Chọn phường/xã --</option>
                    {wards.map((ward) => (
                      <option
                        key={ward.wardCode || ward.code}
                        value={ward.wardCode || ward.code}>
                        {ward.wardName || ward.name}
                      </option>
                    ))}
                  </select>
                  {loadingWards && (
                    <div
                      style={{
                        marginTop: "0.5rem",
                        fontSize: "0.875rem",
                        color: "#6c757d",
                      }}>
                      Đang tải...
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "600",
                    color: "#495057",
                  }}>
                  Địa chỉ chi tiết (số nhà, tên đường) *
                </label>
                <textarea
                  name="address"
                  value={addressForm.address}
                  onChange={handleAddressFormChange}
                  required
                  rows={3}
                  placeholder="Ví dụ: 123 Đường ABC"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #E2E8F0",
                    borderRadius: "0.25rem",
                    fontSize: "1rem",
                    resize: "vertical",
                  }}
                />
              </div>

              <div
                style={{
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}>
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={addressForm.isDefault}
                  onChange={handleAddressFormChange}
                  id="isDefault"
                />
                <label
                  htmlFor="isDefault"
                  style={{ cursor: "pointer", color: "#495057" }}>
                  Đặt làm địa chỉ mặc định
                </label>
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...styles.buttonPrimary,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1.5rem",
                  }}>
                  <Save size={16} /> Lưu địa chỉ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddressForm(false);
                    setAddressForm({
                      recipientName: "",
                      phoneNumber: "",
                      address: "",
                      isDefault: false,
                    });
                  }}
                  style={{
                    ...styles.buttonSecondary,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1.5rem",
                  }}>
                  <X size={16} /> Hủy
                </button>
              </div>
            </form>
          )}

          {}
          {shippingAddresses.length === 0 ? (
            <p
              style={{
                color: "#6c757d",
                textAlign: "center",
                padding: "2rem",
              }}>
              Chưa có địa chỉ giao hàng nào. Hãy thêm một địa chỉ để bắt đầu.
            </p>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {shippingAddresses.map((address) => {
                const addressId = address.idShippingAddress || address.id;
                const isEditing = editingAddress === addressId;

                return (
                  <div
                    key={addressId}
                    style={{
                      padding: "1.5rem",
                      border: "1px solid #E2E8F0",
                      borderRadius: "0.5rem",
                      backgroundColor: address.isDefault ? "#e0f7ff" : "white",
                    }}>
                    {isEditing ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleUpdateAddress(addressId);
                        }}>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "1rem",
                            marginBottom: "1rem",
                          }}>
                          <div>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontWeight: "600",
                                color: "#495057",
                              }}>
                              Tên người nhận *
                            </label>
                            <input
                              type="text"
                              name="recipientName"
                              value={
                                addressForm.recipientName ||
                                address.recipientName
                              }
                              onChange={handleAddressFormChange}
                              required
                              style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: "1px solid #E2E8F0",
                                borderRadius: "0.25rem",
                                fontSize: "1rem",
                              }}
                            />
                          </div>

                          <div>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontWeight: "600",
                                color: "#495057",
                              }}>
                              Số điện thoại *
                            </label>
                            <input
                              type="tel"
                              name="phoneNumber"
                              value={
                                addressForm.phoneNumber || address.phoneNumber
                              }
                              onChange={handleAddressFormChange}
                              required
                              style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: "1px solid #E2E8F0",
                                borderRadius: "0.25rem",
                                fontSize: "1rem",
                              }}
                            />
                          </div>
                        </div>

                        {}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: "1rem",
                            marginBottom: "1rem",
                          }}>
                          <div>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontWeight: "600",
                                color: "#495057",
                              }}>
                              Tỉnh/Thành phố *
                            </label>
                            <select
                              name="provinceId"
                              value={
                                addressForm.provinceId ||
                                address.provinceId ||
                                ""
                              }
                              onChange={(e) => {
                                const provinceId = e.target.value
                                  ? Number(e.target.value)
                                  : null;
                                setAddressForm((prev) => ({
                                  ...prev,
                                  provinceId,
                                  districtId: null,
                                  wardCode: null,
                                }));
                              }}
                              required
                              disabled={loadingProvinces}
                              style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: "1px solid #E2E8F0",
                                borderRadius: "0.25rem",
                                fontSize: "1rem",
                              }}>
                              <option value="">
                                -- Chọn tỉnh/thành phố --
                              </option>
                              {provinces.map((province) => (
                                <option
                                  key={province.provinceId || province.id}
                                  value={province.provinceId || province.id}>
                                  {province.provinceName || province.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontWeight: "600",
                                color: "#495057",
                              }}>
                              Quận/Huyện *
                            </label>
                            <select
                              name="districtId"
                              value={
                                addressForm.districtId ||
                                address.districtId ||
                                ""
                              }
                              onChange={(e) => {
                                const districtId = e.target.value
                                  ? Number(e.target.value)
                                  : null;
                                setAddressForm((prev) => ({
                                  ...prev,
                                  districtId,
                                  wardCode: null,
                                }));
                              }}
                              required
                              disabled={
                                (!addressForm.provinceId &&
                                  !address.provinceId) ||
                                loadingDistricts
                              }
                              style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: "1px solid #E2E8F0",
                                borderRadius: "0.25rem",
                                fontSize: "1rem",
                                opacity:
                                  !addressForm.provinceId && !address.provinceId
                                    ? 0.6
                                    : 1,
                              }}>
                              <option value="">-- Chọn quận/huyện --</option>
                              {districts.map((district) => (
                                <option
                                  key={district.districtId || district.id}
                                  value={district.districtId || district.id}>
                                  {district.districtName || district.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontWeight: "600",
                                color: "#495057",
                              }}>
                              Phường/Xã *
                            </label>
                            <select
                              name="wardCode"
                              value={
                                addressForm.wardCode || address.wardCode || ""
                              }
                              onChange={(e) => {
                                setAddressForm((prev) => ({
                                  ...prev,
                                  wardCode: e.target.value || null,
                                }));
                              }}
                              required
                              disabled={
                                (!addressForm.districtId &&
                                  !address.districtId) ||
                                loadingWards
                              }
                              style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: "1px solid #E2E8F0",
                                borderRadius: "0.25rem",
                                fontSize: "1rem",
                                opacity:
                                  !addressForm.districtId && !address.districtId
                                    ? 0.6
                                    : 1,
                              }}>
                              <option value="">-- Chọn phường/xã --</option>
                              {wards.map((ward) => (
                                <option
                                  key={ward.wardCode || ward.code}
                                  value={ward.wardCode || ward.code}>
                                  {ward.wardName || ward.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div style={{ marginBottom: "1rem" }}>
                          <label
                            style={{
                              display: "block",
                              marginBottom: "0.5rem",
                              fontWeight: "600",
                              color: "#495057",
                            }}>
                            Địa chỉ chi tiết (số nhà, tên đường) *
                          </label>
                          <textarea
                            name="address"
                            value={addressForm.address || address.address}
                            onChange={handleAddressFormChange}
                            required
                            rows={3}
                            placeholder="Ví dụ: 123 Đường ABC"
                            style={{
                              width: "100%",
                              padding: "0.75rem",
                              border: "1px solid #E2E8F0",
                              borderRadius: "0.25rem",
                              fontSize: "1rem",
                              resize: "vertical",
                            }}
                          />
                        </div>

                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            type="submit"
                            disabled={loading}
                            style={{
                              ...styles.buttonPrimary,
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              padding: "0.5rem 1rem",
                              fontSize: "0.875rem",
                            }}>
                            <Save size={16} /> Lưu
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAddress(null);
                              setAddressForm({
                                recipientName: "",
                                phoneNumber: "",
                                address: "",
                                isDefault: false,
                                provinceId: null,
                                districtId: null,
                                wardCode: null,
                              });
                              setDistricts([]);
                              setWards([]);
                            }}
                            style={{
                              ...styles.buttonSecondary,
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              padding: "0.5rem 1rem",
                              fontSize: "0.875rem",
                            }}>
                            <X size={16} /> Hủy
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: "1rem",
                          }}>
                          <div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                marginBottom: "0.5rem",
                              }}>
                              <strong style={{ fontSize: "1.125rem" }}>
                                {address.recipientName}
                              </strong>
                              {address.isDefault && (
                                <span
                                  style={{
                                    padding: "0.25rem 0.5rem",
                                    backgroundColor: "#28a745",
                                    color: "white",
                                    borderRadius: "0.25rem",
                                    fontSize: "0.75rem",
                                    fontWeight: "600",
                                  }}>
                                  Mặc định
                                </span>
                              )}
                            </div>
                            <p
                              style={{
                                color: "#6c757d",
                                marginBottom: "0.25rem",
                              }}>
                              {formatPhone(address.phoneNumber)}
                            </p>
                            <p style={{ color: "#495057" }}>
                              {address.address}
                            </p>
                          </div>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            {!address.isDefault && (
                              <button
                                onClick={() =>
                                  handleSetDefaultAddress(addressId)
                                }
                                style={{
                                  padding: "0.5rem",
                                  backgroundColor: "#e0f7ff",
                                  color: "#2563EB",
                                  border: "none",
                                  borderRadius: "0.25rem",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                                title="Set as default">
                                <Check size={16} />
                              </button>
                            )}
                            <button
                              onClick={async () => {
                                setEditingAddress(addressId);
                                const formData = {
                                  recipientName: address.recipientName,
                                  phoneNumber: address.phoneNumber,
                                  address: address.address,
                                  isDefault: address.isDefault,
                                  provinceId: address.provinceId || null,
                                  districtId: address.districtId || null,
                                  wardCode: address.wardCode || null,
                                };
                                setAddressForm(formData);

                                if (formData.provinceId) {
                                  try {
                                    setLoadingDistricts(true);
                                    const districtsData =
                                      await ghnService.getDistricts(
                                        formData.provinceId
                                      );
                                    setDistricts(districtsData || []);

                                    if (formData.districtId) {
                                      setLoadingWards(true);
                                      const wardsData =
                                        await ghnService.getWards(
                                          formData.districtId
                                        );
                                      setWards(wardsData || []);
                                      setLoadingWards(false);
                                    }
                                  } catch (error) {
                                    console.error(
                                      "Error fetching districts:",
                                      error
                                    );
                                  } finally {
                                    setLoadingDistricts(false);
                                  }
                                }
                              }}
                              style={{
                                padding: "0.5rem",
                                backgroundColor: "#F8FAFC",
                                color: "#495057",
                                border: "none",
                                borderRadius: "0.25rem",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              title="Edit address">
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(addressId)}
                              style={{
                                padding: "0.5rem",
                                backgroundColor: "#fdecec",
                                color: "#dc3545",
                                border: "none",
                                borderRadius: "0.25rem",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              title="Delete address">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
