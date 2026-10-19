import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/apiCategories';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import CustomSelect from '../components/ui/CustomSelect';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import CategoryForm from '../components/CategoryForm';
import { Plus, Pencil, Trash2, LayoutDashboard, Search, ArrowUpDown, X, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export default function Categories() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const queryClient = useQueryClient();

  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('သိမ်းပြီးပါပြီ');
      handleCloseModal();
    },
    onError: (err) => toast.error('မအောင်မြင်ပါ', { description: err.message }),
  });

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('ပြင်ဆင်ပြီးပါပြီ');
      handleCloseModal();
    },
    onError: (err) => toast.error('မအောင်မြင်ပါ', { description: err.message }),
  });

  const { mutate: deleteCat, isPending: isDeleting } = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('ဖျက်ပြီးပါပြီ');
      setCategoryToDelete(null);
    },
    onError: (err) => toast.error('မအောင်မြင်ပါ', { description: err.message }),
  });

  const handleOpenModal = (category = null) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSave = (name) => {
    if (editingCategory) {
      update({ id: editingCategory.id, name });
    } else {
      create(name);
    }
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      deleteCat(categoryToDelete.id);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSortBy('newest');
  };

  const hasActiveFilters = searchQuery.trim() !== '' || sortBy !== 'newest';

  // Filtered & Sorted categories
  const filteredCategories = useMemo(() => {
    let result = [...categories];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((c) => c.name.toLowerCase().includes(q));
    }

    result.sort((a, b) => {
      switch (sortBy) {
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
  }, [categories, searchQuery, sortBy]);

  if (error) {
    return (
      <ErrorState
        message={error.message}
        onRetry={() => queryClient.invalidateQueries({ queryKey: ['categories'] })}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Compact Page Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-600 shadow-xs">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">အမျိုးအစားများ</h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {filteredCategories.length}
            </span>
          </div>
        </div>

        <Button
          onClick={() => handleOpenModal()}
          className="rounded-xl shadow-xs gap-1.5 h-9 px-3.5 text-xs font-bold"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>အမျိုးအစားသစ်</span>
        </Button>
      </div>

      {/* Single-row Toolbar */}
      <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-gray-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="အမျိုးအစား ရှာရန်..."
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

          {/* Sort & Reset */}
          <div className="flex items-center gap-2 justify-end">
            <CustomSelect
              value={sortBy}
              onChange={setSortBy}
              icon={<ArrowUpDown className="h-3.5 w-3.5" />}
              options={[
                { value: 'newest', label: 'အသစ်ဆုံး' },
                { value: 'oldest', label: 'အဟောင်းဆုံး' },
                { value: 'name_asc', label: 'အမည် (A - Z)' },
                { value: 'name_desc', label: 'အမည် (Z - A)' },
              ]}
            />

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
      {isLoading ? (
        <LoadingState type="table" cols={3} rows={5} />
      ) : filteredCategories.length === 0 ? (
        hasActiveFilters ? (
          <EmptyState
            title="ရှာမတွေ့ပါ"
            description="အခြား စကားလုံးဖြင့် ရှာဖွေပါ"
            actionText="ရှင်းမည်"
            actionIcon={<RotateCcw className="h-3.5 w-3.5" />}
            onAction={handleClearFilters}
          />
        ) : (
          <EmptyState
            title="အမျိုးအစား မရှိသေးပါ"
            actionText="အမျိုးအစားသစ်"
            actionIcon={<Plus className="h-3.5 w-3.5" />}
            actionVariant="default"
            onAction={() => handleOpenModal()}
          />
        )
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/70 border-b border-gray-200">
                <TableRow>
                  <TableHead className="font-bold w-[70px] text-gray-700">စဉ်</TableHead>
                  <TableHead className="font-bold text-gray-700">အမျိုးအစား အမည်</TableHead>
                  <TableHead className="text-right font-bold text-gray-700 w-[120px]">လုပ်ဆောင်ချက်</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category, index) => (
                  <TableRow key={category.id} className="hover:bg-gray-50/60 transition-colors group">
                    <TableCell className="font-medium text-gray-500 text-sm">{index + 1}</TableCell>
                    <TableCell className="font-bold text-gray-900 group-hover:text-primary transition-colors">
                      {category.name}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleOpenModal(category)}
                          title="ပြင်မည်"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg h-8 w-8 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteClick(category)}
                          title="ဖျက်မည်"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg h-8 w-8 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Category Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCategory ? 'အမျိုးအစား ပြင်ရန်' : 'အမျိုးအစား အသစ်ထည့်ရန်'}
      >
        <CategoryForm
          categoryToEdit={editingCategory}
          onClose={handleCloseModal}
          onSave={handleSave}
          isLoading={isCreating || isUpdating}
        />
      </Modal>

      {/* Custom Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(categoryToDelete)}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleConfirmDelete}
        itemName={categoryToDelete?.name || ''}
        isLoading={isDeleting}
      />
    </div>
  );
}
