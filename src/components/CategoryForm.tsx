import { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { categorySchema } from '../schemas';

export default function CategoryForm({ categoryToEdit, onClose, onSave, isLoading }) {
  const isEditing = Boolean(categoryToEdit?.id);
  const [prevId, setPrevId] = useState(categoryToEdit?.id);
  const [categoryName, setCategoryName] = useState(categoryToEdit?.name || '');

  if (prevId !== categoryToEdit?.id) {
    setPrevId(categoryToEdit?.id);
    setCategoryName(categoryToEdit?.name || '');
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsed = categorySchema.safeParse({ name: categoryName });
    if (!parsed.success) return;
    onSave(parsed.data.name);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-800">
          အမျိုးအစား အမည် <span className="text-red-500">*</span>
        </label>
        <Input
          required
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="ဥပမာ - အစားအစာ"
          disabled={isLoading}
          className="h-10 rounded-xl text-sm"
        />
      </div>

      <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          className="rounded-xl h-10 px-4 text-xs font-bold"
        >
          မလုပ်တော့ပါ
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
          className="rounded-xl h-10 px-5 text-xs font-bold shadow-xs"
        >
          {isEditing ? 'ပြင်မည်' : 'သိမ်းမည်'}
        </Button>
      </div>
    </form>
  );
}
