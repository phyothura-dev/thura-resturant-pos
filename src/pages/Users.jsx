import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, deleteUser } from '../services/apiUsers';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import CustomSelect from '../components/ui/CustomSelect';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import UserForm from '../components/UserForm';
import { Plus, Pencil, Trash2, Users as UsersIcon, Search, ArrowUpDown, Shield, X, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export default function Users() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const queryClient = useQueryClient();

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const { mutate: delUser, isPending: isDeleting } = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('ဖျက်ပြီးပါပြီ');
      setUserToDelete(null);
    },
    onError: (err) => toast.error('မအောင်မြင်ပါ', { description: err.message }),
  });

  const handleOpenModal = (user = null) => {
    setUserToEdit(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setUserToEdit(null);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      delUser(userToDelete.id);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setRoleFilter('all');
    setSortBy('newest');
  };

  const hasActiveFilters = searchQuery.trim() !== '' || roleFilter !== 'all' || sortBy !== 'newest';

  // Role counts
  const roleCounts = useMemo(() => {
    const counts = { all: users.length, admin: 0, staff: 0 };
    users.forEach((u) => {
      if (u.role === 'admin') counts.admin++;
      else counts.staff++;
    });
    return counts;
  }, [users]);

  // Filtered & Sorted users
  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (u) =>
          (u.full_name && u.full_name.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q))
      );
    }

    if (roleFilter !== 'all') {
      result = result.filter((u) => u.role === roleFilter);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return (a.full_name || '').localeCompare(b.full_name || '', 'my');
        case 'email_asc':
          return (a.email || '').localeCompare(b.email || '');
        case 'oldest':
          return new Date(a.created).getTime() - new Date(b.created).getTime();
        case 'newest':
        default:
          return new Date(b.created).getTime() - new Date(a.created).getTime();
      }
    });

    return result;
  }, [users, searchQuery, roleFilter, sortBy]);

  if (error) {
    return (
      <ErrorState
        message={error.message}
        onRetry={() => queryClient.invalidateQueries({ queryKey: ['users'] })}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Compact Page Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-600 shadow-xs">
            <UsersIcon className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">အသုံးပြုသူများ</h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {filteredUsers.length}
            </span>
          </div>
        </div>

        <Button
          onClick={() => handleOpenModal()}
          className="rounded-xl shadow-xs gap-1.5 h-9 px-3.5 text-xs font-bold"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>အသုံးပြုသူသစ်</span>
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
              placeholder="အမည် သို့မဟုတ် အီးမေးလ် ရှာရန်..."
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

          {/* Controls: Role Filter, Sort & Reset */}
          <div className="flex flex-wrap items-center gap-2 justify-end">
            {/* Role Filter */}
            <CustomSelect
              value={roleFilter}
              onChange={setRoleFilter}
              icon={<Shield className="h-3.5 w-3.5" />}
              placeholder="ရာထူး: အားလုံး"
              options={[
                { value: 'all', label: `အားလုံး (${roleCounts.all})` },
                { value: 'admin', label: `Admin (${roleCounts.admin})` },
                { value: 'staff', label: `Staff (${roleCounts.staff})` },
              ]}
            />

            {/* Sort Dropdown */}
            <CustomSelect
              value={sortBy}
              onChange={setSortBy}
              icon={<ArrowUpDown className="h-3.5 w-3.5" />}
              options={[
                { value: 'newest', label: 'အသစ်ဆုံး' },
                { value: 'oldest', label: 'အဟောင်းဆုံး' },
                { value: 'name_asc', label: 'အမည် (A - Z)' },
                { value: 'email_asc', label: 'အီးမေးလ် (A - Z)' },
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
        <LoadingState type="table" cols={5} rows={5} />
      ) : filteredUsers.length === 0 ? (
        hasActiveFilters ? (
          <EmptyState
            title="ရှာမတွေ့ပါ"
            description="အခြား စကားလုံး သို့မဟုတ် ရာထူးဖြင့် ရှာပါ"
            actionText="ရှင်းမည်"
            actionIcon={<RotateCcw className="h-3.5 w-3.5" />}
            onAction={handleClearFilters}
          />
        ) : (
          <EmptyState
            title="အသုံးပြုသူ မရှိသေးပါ"
            actionText="အသုံးပြုသူသစ်"
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
                  <TableHead className="font-bold text-gray-700">အမည်</TableHead>
                  <TableHead className="font-bold text-gray-700">အီးမေးလ်</TableHead>
                  <TableHead className="font-bold text-gray-700">ရာထူး</TableHead>
                  <TableHead className="text-right font-bold text-gray-700 w-[120px]">လုပ်ဆောင်ချက်</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user, index) => (
                  <TableRow key={user.id} className="hover:bg-gray-50/60 transition-colors group">
                    <TableCell className="font-medium text-gray-500 text-sm">{index + 1}</TableCell>
                    <TableCell className="font-bold text-gray-900 group-hover:text-primary transition-colors">
                      {user.full_name || 'အမည်မရှိပါ'}
                    </TableCell>
                    <TableCell className="text-gray-600 font-mono text-xs">{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={user.role === 'admin' ? 'default' : 'secondary'}
                        className={`font-semibold capitalize text-xs ${
                          user.role === 'admin'
                            ? 'bg-primary text-white'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {user.role === 'admin' ? 'Admin' : 'Staff'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleOpenModal(user)}
                          title="ပြင်မည်"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg h-8 w-8 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteClick(user)}
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

      {/* User Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={userToEdit ? 'အသုံးပြုသူ ပြင်ရန်' : 'အသုံးပြုသူ အသစ်ထည့်ရန်'}
      >
        <UserForm
          userToEdit={userToEdit}
          onClose={handleCloseModal}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['users'] })}
        />
      </Modal>

      {/* Custom Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleConfirmDelete}
        itemName={userToDelete?.full_name || userToDelete?.email || ''}
        itemDescription={userToDelete?.email}
        isLoading={isDeleting}
      />
    </div>
  );
}
