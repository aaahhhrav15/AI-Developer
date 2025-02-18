'use client';
import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { UserContext } from '@/context/userContext';
import toast, { Toaster } from 'react-hot-toast';

export default function RegisterForm() {
  const router = useRouter(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { setUser } = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.post('/api/users/register', { email, password });

      toast.success('Registration successful!');
      router.push('/'); 

      console.log('User Data:', data);
      localStorage.setItem('token', data.token);
      setUser(data.user);

    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Something went wrong';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <Toaster />
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Create Account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? 
          <button
            className="ml-1 text-blue-600 hover:underline"
            onClick={() => router.push('/login')}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}