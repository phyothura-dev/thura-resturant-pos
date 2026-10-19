import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, deleteProduct } from '../services/apiProducts';
import { getCategories } from '../services/apiCategories';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import CustomSelect from '../components/ui/CustomSelect';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import ProductCard from '@/components/ProductCard';
import ProductTableView from '@/components/ProductTableView';
import ProductForm from '@/components/ProductForm';
import {
  Plus,
  Package,
  LayoutGrid,
  List,
  Search,
  ArrowUpDown,
  Filter,
  X,
  RotateCcw,
  UtensilsCrossed,
} from 'lucide-react';
import { APP_CONFIG, ROLES } from '@/config/constants';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function Products() {
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;
  const queryClient = useQueryClient();

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  // Filters & View state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('products_view_mode') || 'grid';
  });

  useEffect(() => {
    localStorage.setItem('products_view_mode', viewMode);
  }, [viewMode]);

  // Queries
  const {
    data: products = [],
    isLoading: isProductsLoading,
    error,
  } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  // Delete Mutation
  const { mutate: deleteProd, isPending: isDeleting } = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('ဖျက်ပြီးပါပြီ');
      setProductToDelete(null);
    },
    onError: (err) => {
      toast.error('မအောင်မြင်ပါ', { description: err.message });
    },
  });

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: products.length };
    products.forEach((p) => {
      const catId = p.category_id || p.categories?.id || 'uncategorized';
      counts[catId] = (counts[catId] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.categories?.name?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(
        (p) => (p.category_id || p.categories?.id) === selectedCategory
      );
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return (Number(a.price) || 0) - (Number(b.price) || 0);
        case 'price_desc':
          return (Number(b.price) || 0) - (Number(a.price) || 0);
        case 'name_asc':
          return a.name.localeCompare(b.name, 'my');
        case 'name_desc':
          return b.name.localeCompare(a.name, 'my');
        case 'oldest':
          return new Date(a.created).getTime() - new Date(b.created).getTime();
        case 'newest':
        default:
          return new Date(b.created).getTime() - new Date(a.created).getTime();
      }
    });

    return result;
  }, [products, searchQuery, selectedCategory, sortBy]);

  // Modal handlers
  const handleOpenFormModal = (product = null) => {
    setEditingProduct(product);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProd(productToDelete.id);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('newest');
  };

  const hasActiveFilters = searchQuery.trim() !== '' || selectedCategory !== 'all' || sortBy !== 'newest';

  if (error) {
    return (
      <ErrorState
        message={error.message}
        onRetry={() => queryClient.invalidateQueries({ queryKey: ['products'] })}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Compact Page Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-600 shadow-xs">
            <Package className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">ကုန်ပစ္စည်းများ</h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {filteredProducts.length}
            </span>
          </div>
        </div>

        {isAdmin && (
          <Button
            onClick={() => handleOpenFormModal()}
            className="rounded-xl shadow-xs gap-1.5 h-9 px-3.5 text-xs font-bold"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>ပစ္စည်းသစ်</span>
          </Button>
        )}
      </div>

      {/* Sleek Single-Row Toolbar */}
      <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-gray-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row gap-2.5 items-stretch lg:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ကုန်ပစ္စည်း ရှာရန်..."
              className="pl-9 pr-8 h-10 rounded-xl bg-gray-50/70 border-gray-200 focus:bg-white text-xs sm:text-sm font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Controls: Category Dropdown, Sort Dropdown & View Mode Switcher */}
          <div className="flex flex-wrap items-center gap-2 justify-start sm:justify-end">
            {/* Category Custom Dropdown */}
            <CustomSelect
              value={selectedCategory}
              onChange={setSelectedCategory}
              icon={<Filter className="h-3.5 w-3.5" />}
              placeholder="အမျိုးအစား: အားလုံး"
              options={[
                { value: 'all', label: `အားလုံး (${categoryCounts.all || 0})` },
                ...categories.map((cat) => ({
                  value: cat.id,
                  label: `${cat.name} (${categoryCounts[cat.id] || 0})`,
                })),
              ]}
            />

            {/* Sort Custom Dropdown */}
            <CustomSelect
              value={sortBy}
              onChange={setSortBy}
              icon={<ArrowUpDown className="h-3.5 w-3.5" />}
              options={[
                { value: 'newest', label: 'အသစ်ဆုံး' },
                { value: 'oldest', label: 'အဟောင်းဆုံး' },
                { value: 'price_asc', label: 'ဈေးနှုန်း: အနည်းမှ အများ' },
                { value: 'price_desc', label: 'ဈေးနှုန်း: အများမှ အနည်း' },
                { value: 'name_asc', label: 'အမည် (A - Z)' },
                { value: 'name_desc', label: 'အမည် (Z - A)' },
              ]}
            />

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100/80 p-0.5 rounded-xl border border-gray-200 h-10 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`h-full px-2.5 rounded-lg transition-all flex items-center justify-center ${
                  viewMode === 'grid'
                    ? 'bg-white text-primary shadow-xs font-bold'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                title="Grid View (ကတ်ပုံစံ)"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`h-full px-2.5 rounded-lg transition-all flex items-center justify-center ${
                  viewMode === 'table'
                    ? 'bg-white text-primary shadow-xs font-bold'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                title="Table View (စာရင်းဇယားပုံစံ)"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Clear Filter button if active */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-10 px-2.5 text-xs text-primary hover:text-primary/90 hover:bg-emerald-50 rounded-xl gap-1 shrink-0"
                title="Filter ရှင်းမည်"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">ရှင်းမည်</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isProductsLoading ? (
        <LoadingState type={viewMode === 'grid' ? 'card' : 'table'} rows={4} cols={5} />
      ) : filteredProducts.length === 0 ? (
        hasActiveFilters ? (
          <EmptyState
            icon={UtensilsCrossed}
            title="ရှာမတွေ့ပါ"
            description="အခြား စကားလုံး သို့မဟုတ် အမျိုးအစား စစ်ဆေးပါ"
            actionText="ရှင်းမည်"
            actionIcon={<RotateCcw className="h-3.5 w-3.5" />}
            onAction={handleClearFilters}
          />
        ) : (
          <EmptyState
            icon={UtensilsCrossed}
            title="ကုန်ပစ္စည်း မရှိသေးပါ"
            actionText="ပစ္စည်းသစ်"
            actionIcon={<Plus className="h-3.5 w-3.5" />}
            actionVariant="default"
            onAction={() => handleOpenFormModal()}
          />
        )
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              handleOpenModal={handleOpenFormModal}
              handleDelete={handleDeleteClick}
              isProduct={true}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <ProductTableView
          products={filteredProducts}
          handleOpenModal={handleOpenFormModal}
          handleDelete={handleDeleteClick}
          isAdmin={isAdmin}
        />
      )}

      {/* Create / Edit Product Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        title={editingProduct ? 'ပစ္စည်း ပြင်ရန်' : 'ပစ္စည်းသစ် ထည့်ရန်'}
      >
        <ProductForm productToEdit={editingProduct} onClose={handleCloseFormModal} />
      </Modal>

      {/* Styled Delete Confirmation Dialog */}
      <DeleteConfirmModal
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleConfirmDelete}
        itemName={productToDelete?.name || ''}
        itemDescription={
          productToDelete?.price
            ? `ဈေးနှုန်း: ${productToDelete.price.toLocaleString()} ${APP_CONFIG.CURRENCY}`
            : ''
        }
        isLoading={isDeleting}
      />
    </div>
  );
}
