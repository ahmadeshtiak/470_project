import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axios";

export default function AddCar() {
  const [formData, setFormData] = useState({
    model: "",
    brand: "",
    year: new Date().getFullYear(),
    price: "",
    price: "",
    condition: "used",
    colors: "",
    rims: "",
    accessories: "",
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "year" || name === "price" ? Number(value) : value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 10) {
      setError("Maximum 10 images allowed");
      return;
    }

    if (images.length + files.length > 10) {
      setError("Total images cannot exceed 10");
      return;
    }

    setImages((prev) => [...prev, ...files]);

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (images.length === 0) {
      setError("At least one image is required");
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("model", formData.model);
      formDataToSend.append("brand", formData.brand);
      formDataToSend.append("year", formData.year);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("condition", formData.condition);

      // Convert comma-separated strings to arrays
      const colorsArray = formData.colors.split(",").map(item => item.trim()).filter(item => item);
      const rimsArray = formData.rims.split(",").map(item => item.trim()).filter(item => item);
      const accessoriesArray = formData.accessories.split(",").map(item => item.trim()).filter(item => item);

      formDataToSend.append("colors", JSON.stringify(colorsArray));
      formDataToSend.append("rims", JSON.stringify(rimsArray));
      formDataToSend.append("accessories", JSON.stringify(accessoriesArray));

      images.forEach((image) => {
        formDataToSend.append("images", image);
      });

      const response = await axiosInstance.post("/cars", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Redirect to the detail page of the newly created car
      const carId = response.data.data._id;

      // If role was updated, we still need to refresh user data
      // But we'll do it after navigation to avoid losing the new car context
      if (response.data.roleUpdated) {
        // Refresh user data in the background
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }

      navigate(`/cars/${carId}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create car listing");
      console.error("Error creating car:", err);
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Add New Car Listing</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                Brand *
              </label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
                className="block text-sm font-regular text-gray-900 mb-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Toyota, Honda, BMW"
              />
            </div>

            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                Model *
              </label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                required
                className="block text-sm font-regular text-gray-900 mb-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Camry, Civic, 3 Series"
              />
            </div>

            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                Year *
              </label>
              <select
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                className="block text-sm font-regular text-gray-900 mb-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Price (৳) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="100"
                className="block text-sm font-regular text-gray-900 mb-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 25000"
              />
            </div>

            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
                Condition *
              </label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                required
                className="block text-sm font-regular text-gray-900 mb-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="new">New</option>
                <option value="used">Used</option>
              </select>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Customization Options</h3>
              <p className="text-sm text-gray-500 mb-4">Enter available options separated by commas (e.g., Red, Blue, Black)</p>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="colors" className="block text-sm font-medium text-gray-700 mb-2">
                    Available Colors
                  </label>
                  <input
                    type="text"
                    id="colors"
                    name="colors"
                    value={formData.colors}
                    onChange={handleChange}
                    className="block text-sm font-regular text-gray-900 mb-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Red, Blue, Black, White"
                  />
                </div>

                <div>
                  <label htmlFor="rims" className="block text-sm font-medium text-gray-700 mb-2">
                    Available Rims
                  </label>
                  <input
                    type="text"
                    id="rims"
                    name="rims"
                    value={formData.rims}
                    onChange={handleChange}
                    className="block text-sm font-regular text-gray-900 mb-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Standard, Sport, Alloy, Matte Black"
                  />
                </div>

                <div>
                  <label htmlFor="accessories" className="block text-sm font-medium text-gray-700 mb-2">
                    Available Accessories
                  </label>
                  <textarea
                    id="accessories"
                    name="accessories"
                    value={formData.accessories}
                    onChange={handleChange}
                    rows="3"
                    className="block text-sm font-regular text-gray-900 mb-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="GPS Navigation, Leather Seats, Sunroof, Heated Seats"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
                Images * (Up to 10 images)
              </label>
              <input
                type="file"
                id="images"
                name="images"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="block text-sm font-regular text-gray-900 mb-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required={images.length === 0}
              />
              <p className="mt-1 text-sm text-gray-500">
                Select one or more images (Maximum 10 images, {images.length} selected)
              </p>

              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                        aria-label="Remove image"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || images.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
              >
                {loading ? "Creating..." : "Create Listing"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/cars")}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-lg transition duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
