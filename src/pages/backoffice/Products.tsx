import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { productsApi } from '../../api/products.api';
import { categoriesApi } from '../../api/categories.api';
import { warehousesApi } from '../../api/warehouses.api';
import { Product, CreateProductDto } from '../../types/product';
import { Category } from '../../types/category';
import { Warehouse } from '../../types/warehouse';
import { Plus, Edit, Trash2, Search, AlertTriangle, Camera, Upload, X, RefreshCw, CheckCircle, Barcode, Printer, Eye } from 'lucide-react';
import { toast } from 'sonner';
import JsBarcode from 'jsbarcode';

export default function Products() {
  const { user } = useAuth();
  const businessId = user?.business_id;
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [showLowStock, setShowLowStock] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Image scan states
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanStep, setScanStep] = useState<'upload' | 'review'>('upload');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<any>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [categoryMatchStatus, setCategoryMatchStatus] = useState<'matched' | 'no-match' | null>(null);
  const [matchedCategoryName, setMatchedCategoryName] = useState<string | null>(null);
  const [generatingSku, setGeneratingSku] = useState(false);
  const [skuError, setSkuError] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [generatingDetailBarcode, setGeneratingDetailBarcode] = useState(false);
  
  const [formData, setFormData] = useState<CreateProductDto>({
    name: '',
    reference: '',
    description: '',
    category_id: '',
    unit: 'pièce',
    sale_price_ht: 0,
    purchase_price_ht: 0,
    current_stock: 0,
    min_stock_threshold: 0,
    is_stockable: true,
  });

  useEffect(() => {
    if (businessId) {
      loadProducts();
      loadCategories();
      loadWarehouses();
    }
  }, [businessId, searchTerm, selectedCategory, showActiveOnly, showLowStock]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getAll(businessId!, {
        search: searchTerm || undefined,
        category_id: selectedCategory || undefined,
        is_active: showActiveOnly ? true : undefined,
        low_stock: showLowStock ? true : undefined,
      });
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getAll(businessId!, { is_active: true });
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadWarehouses = async () => {
    try {
      const data = await warehousesApi.getAll(businessId!, { is_active: true });
      setWarehouses(data);
    } catch (error) {
      console.error('Error loading warehouses:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productsApi.update(businessId!, editingProduct.id, formData);
      } else {
        await productsApi.create(businessId!, formData);
      }
      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      loadProducts();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      reference: '',
      description: '',
      category_id: '',
      unit: 'pièce',
      sale_price_ht: 0,
      purchase_price_ht: 0,
      current_stock: 0,
      min_stock_threshold: 0,
      is_stockable: true,
    });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      reference: product.reference,
      description: product.description || '',
      category_id: product.category_id || '',
      warehouse_id: product.warehouse_id || '',
      unit: product.unit,
      sale_price_ht: product.sale_price_ht,
      purchase_price_ht: product.purchase_price_ht,
      current_stock: product.current_stock,
      min_stock_threshold: product.min_stock_threshold,
      is_stockable: product.is_stockable,
      barcode: product.barcode || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsApi.delete(businessId!, id);
        loadProducts();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Error deleting product');
      }
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await productsApi.update(businessId!, product.id, {
        is_active: !product.is_active,
      });
      loadProducts();
    } catch (error) {
      console.error('Error toggling product status:', error);
    }
  };

  const isLowStock = (product: Product) => {
    return product.is_stockable && product.current_stock < product.min_stock_threshold;
  };

  // Image scan functions
  const handleImageSelect = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setScanError('Image size must be less than 5MB');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setScanError('Only JPEG, PNG, and WEBP images are supported');
      return;
    }
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setScanError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageSelect(file);
  };

  const handleScanImage = async () => {
    if (!selectedImage) return;
    
    setScanning(true);
    setScanError(null);
    
    try {
      const result = await productsApi.scanImage(businessId!, selectedImage);
      setScannedData(result);
      
      // Pre-fill form with scanned data
      setFormData({
        name: result.name || '',
        reference: '',
        description: result.description || '',
        category_id: '',
        unit: result.unit || 'pièce',
        sale_price_ht: result.sale_price_ht || 0,
        purchase_price_ht: 0,
        current_stock: 0,
        min_stock_threshold: 0,
        is_stockable: true,
        barcode: result.barcode || '',
      });
      
      // Handle category matching
      if (result.suggested_category_name) {
        await handleCategoryMatching(result.suggested_category_name);
      }
      
      setScanStep('review');
    } catch (error: any) {
      setScanError(error.response?.data?.message || 'Failed to scan image. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  const handleCategoryMatching = async (suggestedName: string) => {
    try {
      // Fetch all categories
      const allCategories = await categoriesApi.getAll(businessId!);
      
      // Case-insensitive match
      const matchedCategory = allCategories.find(
        cat => cat.name.toLowerCase() === suggestedName.toLowerCase()
      );
      
      if (matchedCategory) {
        // Auto-select the matched category
        setFormData(prev => ({ ...prev, category_id: matchedCategory.id }));
        setCategoryMatchStatus('matched');
        setMatchedCategoryName(matchedCategory.name);
      } else {
        // Show modal to create new category
        setCategoryMatchStatus('no-match');
        setNewCategoryName(suggestedName);
        setNewCategoryDescription(`Products in the ${suggestedName} category`);
        setShowCategoryModal(true);
      }
    } catch (error) {
      console.error('Error matching category:', error);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setCategoryError('Category name is required');
      return;
    }
    
    setCreatingCategory(true);
    setCategoryError(null);
    
    try {
      const newCategory = await categoriesApi.create(businessId!, {
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || undefined,
      });
      
      // Add to categories list
      setCategories(prev => [...prev, newCategory]);
      
      // Auto-select the new category
      setFormData(prev => ({ ...prev, category_id: newCategory.id }));
      
      // Close modal and show success
      setShowCategoryModal(false);
      toast.success('Category created and selected');
      setCategoryMatchStatus('matched');
      setMatchedCategoryName(newCategory.name);
    } catch (error: any) {
      setCategoryError(error.response?.data?.message || 'Failed to create category');
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleDeclineCategory = () => {
    setShowCategoryModal(false);
    setCategoryMatchStatus(null);
    setNewCategoryName('');
    setNewCategoryDescription('');
    setCategoryError(null);
  };

  const handleGenerateSku = async () => {
    // Check if user has manually entered a SKU
    if (formData.reference && formData.reference.trim()) {
      const confirmed = window.confirm('This will replace your current SKU. Continue?');
      if (!confirmed) return;
    }

    setGeneratingSku(true);
    setSkuError(null);

    try {
      // Get category name from selected category
      let categoryName: string | null = null;
      if (formData.category_id) {
        const selectedCategory = categories.find(cat => cat.id === formData.category_id);
        categoryName = selectedCategory?.name || null;
      }

      const result = await productsApi.generateSku(businessId!, {
        category_name: categoryName,
        brand: null, // No brand field yet
        name: formData.name || null,
        unit: formData.unit || null,
        extra_attribute: null, // For future use
      });

      setFormData(prev => ({ ...prev, reference: result.sku }));
    } catch (error: any) {
      setSkuError(error.response?.data?.message || 'Failed to generate SKU');
    } finally {
      setGeneratingSku(false);
    }
  };

  const handleGenerateBarcode = async (productId: string) => {
    try {
      const updatedProduct = await productsApi.generateBarcode(businessId!, productId);
      
      // Update the product in the local state
      setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));
      
      toast.success('Barcode generated');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate barcode');
    }
  };

  const handlePrintLabel = async (productId: string, productSku: string) => {
    try {
      const blob = await productsApi.downloadLabel(businessId!, productId);
      
      // Create temporary anchor and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `label-${productSku}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to download label');
    }
  };

  const handleRegenerateBarcode = async () => {
    if (!editingProduct) return;
    
    try {
      const updatedProduct = await productsApi.generateBarcode(businessId!, editingProduct.id);
      setFormData(prev => ({ ...prev, barcode: updatedProduct.barcode || '' }));
      toast.success('Barcode regenerated');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to regenerate barcode');
    }
  };

  const handleViewProduct = async (product: Product) => {
    setViewingProduct(product);
    setShowDetailModal(true);
  };

  const handleGenerateDetailBarcode = async () => {
    if (!viewingProduct) return;
    
    setGeneratingDetailBarcode(true);
    try {
      const updatedProduct = await productsApi.generateBarcode(businessId!, viewingProduct.id);
      setViewingProduct(updatedProduct);
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      toast.success('Barcode generated');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate barcode');
    } finally {
      setGeneratingDetailBarcode(false);
    }
  };

  // Render barcode SVG when modal opens
  React.useEffect(() => {
    if (showDetailModal && viewingProduct?.barcode) {
      try {
        const svg = document.getElementById('barcode-svg');
        if (svg) {
          JsBarcode(svg, viewingProduct.barcode, {
            format: 'CODE128',
            width: 2,
            height: 80,
            displayValue: false,
          });
        }
      } catch (error) {
        console.error('Error rendering barcode:', error);
      }
    }
  }, [showDetailModal, viewingProduct]);

  const handleSaveScannedProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await productsApi.create(businessId!, formData);
      setShowScanModal(false);
      resetScanModal();
      loadProducts();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving product');
    }
  };

  const resetScanModal = () => {
    setScanStep('upload');
    setSelectedImage(null);
    setImagePreview(null);
    setScanError(null);
    setScannedData(null);
    setCategoryMatchStatus(null);
    setMatchedCategoryName(null);
    setShowCategoryModal(false);
    setNewCategoryName('');
    setNewCategoryDescription('');
    setCategoryError(null);
    setSkuError(null);
    resetForm();
  };

  const handleRescan = () => {
    setScanStep('upload');
    setSelectedImage(null);
    setImagePreview(null);
    setScanError(null);
  };

  if (!businessId) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            No business associated with your account. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              resetScanModal();
              setShowScanModal(true);
            }}
            className="flex items-center gap-2 border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50"
          >
            <Camera size={20} />
            Add via image scan
          </button>
          <button
            onClick={() => {
              setEditingProduct(null);
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            New Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
              className="rounded"
            />
            <span>Active only</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showLowStock}
              onChange={(e) => setShowLowStock(e.target.checked)}
              className="rounded"
            />
            <span>Low stock only</span>
          </label>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reference
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Barcode
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sale Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className={isLowStock(product) ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.reference}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {product.category?.name || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.barcode ? (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-mono bg-gray-100 text-gray-800 rounded">
                        {product.barcode}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {isLowStock(product) && (
                        <AlertTriangle size={16} className="text-red-500" />
                      )}
                      <span className="text-sm text-gray-900">
                        {product.is_stockable
                          ? `${product.current_stock} ${product.unit}`
                          : 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {(product.sale_price_ht || 0).toFixed(3)} DT
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(product)}
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {product.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewProduct(product)}
                        className="text-gray-600 hover:text-gray-900"
                        title="View details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleGenerateBarcode(product.id)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Generate barcode"
                      >
                        <Barcode size={18} />
                      </button>
                      <button
                        onClick={() => handlePrintLabel(product.id, product.reference)}
                        className="text-green-600 hover:text-green-900"
                        title="Print label"
                      >
                        <Printer size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl my-8">
            <h2 className="text-xl font-bold mb-4">
              {editingProduct ? 'Edit Product' : 'New Product'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reference *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                      className="flex-1 px-3 py-2 border rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateSku}
                      disabled={generatingSku}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {generatingSku ? 'Generating...' : 'Generate SKU'}
                    </button>
                  </div>
                  {skuError && (
                    <p className="mt-1 text-sm text-red-600">{skuError}</p>
                  )}
                  {!formData.reference && (
                    <p className="mt-1 text-sm text-gray-500">SKU not generated yet</p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">No Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Warehouse
                  </label>
                  <select
                    value={formData.warehouse_id}
                    onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">No Warehouse</option>
                    {warehouses.map((wh) => (
                      <option key={wh.id} value={wh.id}>
                        {wh.name} ({wh.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sale Price HT (DT)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.sale_price_ht}
                    onChange={(e) =>
                      setFormData({ ...formData, sale_price_ht: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purchase Price HT (DT)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.purchase_price_ht}
                    onChange={(e) =>
                      setFormData({ ...formData, purchase_price_ht: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_stockable}
                    onChange={(e) =>
                      setFormData({ ...formData, is_stockable: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Stockable Product</span>
                </label>
              </div>

              {formData.is_stockable && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Stock
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={formData.current_stock}
                      onChange={(e) =>
                        setFormData({ ...formData, current_stock: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Stock Threshold
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={formData.min_stock_threshold}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          min_stock_threshold: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barcode
                </label>
                {editingProduct && formData.barcode ? (
                  <div className="flex gap-2">
                    <div className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 font-mono text-sm">
                      {formData.barcode}
                    </div>
                    <button
                      type="button"
                      onClick={handleRegenerateBarcode}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 whitespace-nowrap"
                    >
                      Regenerate
                    </button>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                )}
                {!formData.warehouse_id && (
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      No warehouse assigned to this product. The generated barcode will use the GEN prefix instead of a warehouse code. Consider assigning a warehouse first for better traceability.
                    </p>
                  </div>
                )}
                {!editingProduct && !formData.barcode && (
                  <p className="mt-1 text-sm text-gray-500">
                    You can also generate a barcode after saving the product.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Scan Modal */}
      {showScanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {scanStep === 'upload' ? 'Scan Product Image' : 'Review Scanned Product'}
              </h2>
              <button
                onClick={() => {
                  setShowScanModal(false);
                  resetScanModal();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {scanStep === 'upload' ? (
              <div>
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg"
                      />
                      <p className="text-sm text-gray-600">{selectedImage?.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload size={48} className="mx-auto text-gray-400" />
                      <div>
                        <p className="text-lg font-medium text-gray-700">
                          Drop an image here or click to browse
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          Supports JPEG, PNG, WEBP up to 5MB
                        </p>
                      </div>
                    </div>
                  )}
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageSelect(file);
                    }}
                    className="hidden"
                  />
                </div>

                {scanError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{scanError}</p>
                  </div>
                )}

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowScanModal(false);
                      resetScanModal();
                    }}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleScanImage}
                    disabled={!selectedImage || scanning}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {scanning ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Analyzing image...
                      </>
                    ) : (
                      <>
                        <Camera size={20} />
                        Scan image
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveScannedProduct}>
                <div className="grid grid-cols-2 gap-6">
                  {/* Left: Image Preview */}
                  <div>
                    <img
                      src={imagePreview!}
                      alt="Scanned product"
                      className="w-full rounded-lg shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={handleRescan}
                      className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      <RefreshCw size={16} />
                      Re-scan
                    </button>
                  </div>

                  {/* Right: Form */}
                  <div className="space-y-4">
                    {scannedData?.confidence_note && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">{scannedData.confidence_note}</p>
                      </div>
                    )}

                    {categoryMatchStatus === 'matched' && matchedCategoryName && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-green-800">
                          Category <strong>'{matchedCategoryName}'</strong> was detected and automatically selected.
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name * {scannedData?.name && <span className="text-xs text-blue-600">(Detected from image)</span>}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reference *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={formData.reference}
                          onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                          className="flex-1 px-3 py-2 border rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={handleGenerateSku}
                          disabled={generatingSku}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                          {generatingSku ? 'Generating...' : 'Generate SKU'}
                        </button>
                      </div>
                      {skuError && (
                        <p className="mt-1 text-sm text-red-600">{skuError}</p>
                      )}
                      {!formData.reference && (
                        <p className="mt-1 text-sm text-gray-500">SKU not generated yet</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description {scannedData?.description && <span className="text-xs text-blue-600">(Detected from image)</span>}
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <select
                          value={formData.category_id}
                          onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="">No Category</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Warehouse
                        </label>
                        <select
                          value={formData.warehouse_id}
                          onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="">No Warehouse</option>
                          {warehouses.map((wh) => (
                            <option key={wh.id} value={wh.id}>
                              {wh.name} ({wh.code})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Unit {scannedData?.unit && <span className="text-xs text-blue-600">(Detected from image)</span>}
                        </label>
                        <input
                          type="text"
                          value={formData.unit}
                          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Barcode {scannedData?.barcode && <span className="text-xs text-blue-600">(Detected from image)</span>}
                        </label>
                        <input
                          type="text"
                          value={formData.barcode}
                          onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                    </div>

                    {!formData.warehouse_id && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-800">
                          No warehouse assigned to this product. The generated barcode will use the GEN prefix instead of a warehouse code. Consider assigning a warehouse first for better traceability.
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sale Price HT (DT) {scannedData?.sale_price_ht && <span className="text-xs text-blue-600">(Detected from image)</span>}
                        </label>
                        <input
                          type="number"
                          step="0.001"
                          value={formData.sale_price_ht}
                          onChange={(e) =>
                            setFormData({ ...formData, sale_price_ht: parseFloat(e.target.value) || 0 })
                          }
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Purchase Price HT (DT)
                        </label>
                        <input
                          type="number"
                          step="0.001"
                          value={formData.purchase_price_ht}
                          onChange={(e) =>
                            setFormData({ ...formData, purchase_price_ht: parseFloat(e.target.value) || 0 })
                          }
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.is_stockable}
                          onChange={(e) =>
                            setFormData({ ...formData, is_stockable: e.target.checked })
                          }
                          className="rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">Stockable Product</span>
                      </label>
                    </div>

                    {formData.is_stockable && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Stock
                          </label>
                          <input
                            type="number"
                            step="0.001"
                            value={formData.current_stock}
                            onChange={(e) =>
                              setFormData({ ...formData, current_stock: parseFloat(e.target.value) || 0 })
                            }
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Min Stock Threshold
                          </label>
                          <input
                            type="number"
                            step="0.001"
                            value={formData.min_stock_threshold}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                min_stock_threshold: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowScanModal(false);
                          resetScanModal();
                        }}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Save Product
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Category Creation Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">New category suggested</h2>
            <p className="text-sm text-gray-600 mb-4">
              The AI suggested a category that does not exist yet: <strong>'{newCategoryName}'</strong>. Would you like to create it?
            </p>

            {categoryError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{categoryError}</p>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Category name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                  placeholder="Brief description"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleDeclineCategory}
                disabled={creatingCategory}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={handleCreateCategory}
                disabled={creatingCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {creatingCategory ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  'Create and select'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {showDetailModal && viewingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Product Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-gray-900">{viewingProduct.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference/SKU</label>
                  <p className="text-gray-900 font-mono">{viewingProduct.reference}</p>
                </div>
              </div>

              {viewingProduct.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-gray-900">{viewingProduct.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <p className="text-gray-900">{viewingProduct.category?.name || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse</label>
                  <p className="text-gray-900">{viewingProduct.warehouse?.name || '-'}</p>
                </div>
              </div>

              {/* Barcode Section */}
              <div className="border-t pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Barcode</label>
                {viewingProduct.barcode ? (
                  <div className="space-y-4">
                    <div className="flex justify-center bg-white p-4 border rounded-lg">
                      <svg id="barcode-svg"></svg>
                    </div>
                    <p className="text-center font-mono text-sm text-gray-700">
                      {viewingProduct.barcode}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleGenerateDetailBarcode}
                        disabled={generatingDetailBarcode}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {generatingDetailBarcode ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Generating...
                          </>
                        ) : (
                          <>
                            <Barcode size={18} />
                            Regenerate Barcode
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handlePrintLabel(viewingProduct.id, viewingProduct.reference)}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                      >
                        <Printer size={18} />
                        Print Label
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-500 text-center py-4">No barcode generated yet</p>
                    <button
                      onClick={handleGenerateDetailBarcode}
                      disabled={generatingDetailBarcode}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {generatingDetailBarcode ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Barcode size={18} />
                          Generate Barcode
                        </>
                      )}
                    </button>
                  </div>
                )}

                {!viewingProduct.warehouse_id && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      No warehouse assigned to this product. The generated barcode will use the GEN prefix instead of a warehouse code. Consider assigning a warehouse first for better traceability.
                    </p>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="border-t pt-6 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <p className="text-gray-900">{viewingProduct.unit}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price HT</label>
                  <p className="text-gray-900">{(viewingProduct.sale_price_ht || 0).toFixed(3)} DT</p>
                </div>
                {viewingProduct.is_stockable && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
                      <p className="text-gray-900">{viewingProduct.current_stock} {viewingProduct.unit}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock Threshold</label>
                      <p className="text-gray-900">{viewingProduct.min_stock_threshold} {viewingProduct.unit}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
