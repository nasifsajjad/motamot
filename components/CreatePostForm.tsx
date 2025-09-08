// components/CreatePostForm.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NewPostFormData } from '@/types';

const CreatePostForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<NewPostFormData>({
    title: '',
    body: '',
    language: 'en',
    type: 'sharing',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong.');
      }

      // Redirect to the new post page
      router.push(`/posts/${result.slug}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Share your Opinion</h2>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="title" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Heading</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="body" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Main body</label>
        <textarea
          id="body"
          name="body"
          value={formData.body}
          onChange={handleChange}
          required
          rows={10}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>

      <div className="mb-4">
        <label htmlFor="language" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Language</label>
        <select
          id="language"
          name="language"
          value={formData.language}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="en">English</option>
          <option value="bn">বাংলা</option>
        </select>
      </div>
      
      <div className="mb-6">
        <label htmlFor="type" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Type</label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="sharing">Sharing (just sharing opinion)</option>
          <option value="problem">Problem (seeking solution)</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
      >
        {loading ? 'Publishing...' : 'Publish'}
      </button>
    </form>
  );
};

export default CreatePostForm;