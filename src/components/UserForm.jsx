import { useState } from 'react';
import { toast } from 'sonner';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { createUser, updateUser } from '../services/apiUsers';

export default function UserForm({ userToEdit, onClose, onSuccess }) {
  const isEditing = Boolean(userToEdit?.id);
  const [loading, setLoading] = useState(false);

  const [prevId, setPrevId] = useState(userToEdit?.id);
  const [formData, setFormData] = useState({
    full_name: userToEdit?.full_name || '',
    email: userToEdit?.email || '',
    role: userToEdit?.role || 'staff',
    password: '',
  });

  if (prevId !== userToEdit?.id) {
    setPrevId(userToEdit?.id);
    setFormData({
      full_name: userToEdit?.full_name || '',
      email: userToEdit?.email || '',
      role: userToEdit?.role || 'staff',
      password: '',
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        await updateUser({
          id: userToEdit.id,
          full_name: formData.full_name.trim(),
          role: formData.role,
        });
        toast.success('ပြင်ဆင်ပြီးပါပြီ');
      } else {
        await createUser({
          ...formData,
          full_name: formData.full_name.trim(),
        });
        toast.success('ထည့်သွင်းပြီးပါပြီ');
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error('မအောင်မြင်ပါ', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-800">
          အမည် <span className="text-red-500">*</span>
        </label>
        <Input
          required
          placeholder="ဥပမာ - မောင်မောင်"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          className="h-10 rounded-xl text-sm"
          disabled={loading}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-800">
          အီးမေးလ် <span className="text-red-500">*</span>
        </label>
        <Input
          required
          type="email"
          placeholder="staff@pos.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          disabled={isEditing || loading}
          className="h-10 rounded-xl text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-800">ရာထူး</label>
        <select
          className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-gray-800 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          disabled={loading}
        >
          <option value="staff">Staff (ဝန်ထမ်း)</option>
          <option value="admin">Admin (မန်နေဂျာ)</option>
        </select>
      </div>

      {!isEditing && (
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-800">
            စကားဝှက် <span className="text-red-500">*</span>
          </label>
          <Input
            required
            type="password"
            placeholder="စကားဝှက် ရိုက်ထည့်ပါ"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="h-10 rounded-xl text-sm"
            disabled={loading}
          />
        </div>
      )}

      <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={loading}
          className="rounded-xl h-10 px-4 text-xs font-bold"
        >
          မလုပ်တော့ပါ
        </Button>
        <Button
          type="submit"
          isLoading={loading}
          className="rounded-xl h-10 px-5 text-xs font-bold shadow-xs"
        >
          {isEditing ? 'ပြင်မည်' : 'သိမ်းမည်'}
        </Button>
      </div>
    </form>
  );
}
