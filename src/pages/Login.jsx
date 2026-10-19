import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { pb } from '../services/pocketbase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await pb.collection('users').authWithPassword(email, password);
      toast.success('အကောင့်ဝင်ခြင်း အောင်မြင်ပါသည်');
      navigate('/');
    } catch (err) {
      toast.error('အကောင့်ဝင်ခြင်း မအောင်မြင်ပါ', {
        description: err.message || 'အီးမေးလ် သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="mb-6 flex flex-col items-center justify-center text-center">
          <img
            src="/logo.jpeg"
            alt="သူရစားသောက်ဆိုင် Logo"
            className="h-20 w-20 rounded-full object-cover border-2 border-primary/20 shadow-md mb-3"
          />
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">သူရစားသောက်ဆိုင်</h2>
          <p className="text-xs text-primary font-medium mt-0.5">POS စနစ်သို့ အကောင့်ဝင်ပါ</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">အီးမေးလ် </label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-1"
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">စကားဝှက် </label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-1"
              placeholder="******"
            />
          </div>

          <Button type="submit" disabled={loading} className="flex w-full items-center justify-center rounded p-2 font-bold text-white disabled:bg-primary/50">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ဝင်ရောက်နေပါသည်...
              </>
            ) : (
              'အကောင့်ဝင်မည်'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
