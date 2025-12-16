// ========================================
// src/components/scan/GitHubRepoForm.jsx
// ========================================
import React, { useState } from 'react';
import { Github } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { githubRepoSchema } from '../../utils/validators';
import Button from '../common/Button';

const GitHubRepoForm = ({ onSubmit, loading = false }) => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(githubRepoSchema),
        defaultValues: { repoUrl: '', branch: 'main' },
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    GitHub Repository URL
                </label>
                <div className="relative">
                    <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        {...register('repoUrl')}
                        type="text"
                        placeholder="https://github.com/username/repository"
                        className="input pl-10"
                        disabled={loading}
                    />
                </div>
                {errors.repoUrl && (
                    <p className="mt-1 text-sm text-red-400">{errors.repoUrl.message}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    Branch
                </label>
                <input
                    {...register('branch')}
                    type="text"
                    placeholder="main"
                    className="input"
                    disabled={loading}
                />
                {errors.branch && (
                    <p className="mt-1 text-sm text-red-400">{errors.branch.message}</p>
                )}
            </div>

            <Button type="submit" loading={loading} className="w-full">
                Start Scan
            </Button>
        </form>
    );
};

export default GitHubRepoForm;