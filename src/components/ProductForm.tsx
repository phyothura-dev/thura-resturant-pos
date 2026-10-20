import { useState, useRef } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createProduct, updateProduct } from '../services/apiProducts';
import { getCategories } from '../services/apiCategories';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { UploadCloud, Trash2, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { APP_CONFIG } from '@/config/constants';
import { toast } from 'sonner';
import { productSchema } from '../schemas';

export default function ProductForm({ productToEdit = {}, onClose }) {
  const isEditSession = Boolean(productToEdit?.id);
  const { id: editId, ...editValues } = productToEdit || {};

  const [name, setName] = useState(editValues.name || '');
  const [price, setPrice] = useState(editValues.price !== undefined ? String(editValues.price) : '');
  const [categoryId, setCategoryId] = useState(editValues.category_id || editValues.category || '');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(editValues.image_url || '');
  const [removeImage, setRemoveImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const queryClient = useQueryClient();

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('သိမ်းပြီးပါပြီ');
      onClose();
    },
    onError: (err) => toast.error('မအောင်မြင်ပါ', { description: err.message }),
  });

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: (data) => updateProduct({ id: editId, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('ပြင်ဆင်ပြီးပါပြီ');
      onClose();
    },
    onError: (err) => toast.error('မအောင်မြင်ပါ', { description: err.message }),
  });

  const isWorking = isCreating || isUpdating;

  // Process selected file
  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('ကျေးဇူးပြု၍ ဓာတ်ပုံဖိုင် (JPG, PNG, WebP) သာ ရွေးချယ်ပါ');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('ပုံဖိုင်အရွယ်အစားသည် 5MB ထက် မကျော်ရပါ');
      return;
    }
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setRemoveImage(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewUrl('');
    setRemoveImage(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  function handleSubmit(e) {
    e.preventDefault();
    const parsed = productSchema.safeParse({
      name: name.trim(),
      price: Number(price),
      category_id: categoryId || null,
      image: imageFile,
      remove_image: removeImage,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || 'ကုန်ပစ္စည်းအချက်အလက်ကို စစ်ဆေးပါ');
      return;
    }
    const data = parsed.data;

    if (isEditSession) {
      update(data);
    } else {
      create(data);
    }
  }

  const formattedPricePreview = price && !isNaN(Number(price)) ? Number(price).toLocaleString() : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Product Name */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-800">
          ကုန်ပစ္စည်း အမည် <span className="text-red-500">*</span>
        </label>
        <Input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ဥပမာ - ကြက်သားကြော် ထမင်း"
          disabled={isWorking}
          className="h-11 rounded-xl text-sm"
        />
      </div>

      {/* Price & Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-800">
            ဈေးနှုန်း ({APP_CONFIG.CURRENCY}) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input
              type="number"
              min="0"
              step="any"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              disabled={isWorking}
              className="h-11 rounded-xl text-sm pr-12 font-medium"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
              {APP_CONFIG.CURRENCY}
            </span>
          </div>
          {formattedPricePreview && (
            <p className="mt-1 text-xs text-primary font-medium flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              <span>{formattedPricePreview} {APP_CONFIG.CURRENCY}</span>
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-800">
            အမျိုးအစား (Category)
          </label>
          <select
            className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/80 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 text-gray-800 font-medium"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={isWorking || categoriesLoading}
          >
            <option value="">အမျိုးအစား မရွေးချယ်ပါ</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Image Upload with Drag & Drop */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-800">
          ကုန်ပစ္စည်း ဓာတ်ပုံ
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleFileChange}
          disabled={isWorking}
          className="hidden"
          id="product-image-upload"
        />

        {previewUrl && !removeImage ? (
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50/70 p-3">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center">
              <img src={previewUrl} alt="Product preview" className="h-full w-full object-cover" />
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isWorking}
                className="rounded-lg h-9 gap-1.5 text-xs font-semibold"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                ပုံအသစ်လဲမည်
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemoveImage}
                disabled={isWorking}
                className="rounded-lg h-9 gap-1.5 text-xs font-semibold"
              >
                <Trash2 className="h-3.5 w-3.5" />
                ဖယ်ရှားမည်
              </Button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-all duration-200 ${
              isDragging
                ? 'border-primary bg-primary/5 scale-[1.01]'
                : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50/70'
            }`}
          >
            <div className="rounded-2xl bg-emerald-50 text-emerald-600 p-3.5 mb-2.5 border border-emerald-100">
              <UploadCloud className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-gray-800">
              ဓာတ်ပုံ တင်ရန် ဤနေရာကို နှိပ်ပါ သို့မဟုတ် ဖိုင်ဆွဲထည့်ပါ
            </p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP (အများဆုံး 5MB ထိ)</p>
          </div>
        )}
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isWorking}
          className="rounded-xl h-10 px-5"
        >
          မလုပ်တော့ပါ
        </Button>
        <Button
          type="submit"
          isLoading={isWorking}
          className="rounded-xl h-10 px-5 font-bold shadow-sm text-xs"
        >
          {isEditSession ? 'ပြင်မည်' : 'သိမ်းမည်'}
        </Button>
      </div>
    </form>
  );
}
