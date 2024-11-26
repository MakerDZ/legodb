'use client';

import { Input, Spinner } from '@nextui-org/react';
import { Select, SelectItem } from '@nextui-org/react';
import { Button } from '@nextui-org/react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAction } from 'next-safe-action/hooks';
import { useEffect } from 'react';
import { createNewRole } from './action'; 
import { createRoleSchema, TypeRoleSchema } from '@/validation/role';
import toast from 'react-hot-toast';

const RoleUser = ['God', 'Entry'];

const RoleAndPermission = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        watch,
        clearErrors,
    } = useForm<TypeRoleSchema>({
        resolver: zodResolver(createRoleSchema),
    });

    const watchRole = watch('role');

    useEffect(() => {
        if (watchRole) {
            clearErrors('role');
        }
    }, [watchRole, clearErrors]);

    const { execute, result, status } = useAction(createNewRole);

    const onSubmit = async (values: TypeRoleSchema) => {
        execute(values);
        reset();
    };

    useEffect(() => {
        if (result.data?.status === 'success') {
            const data = result.data.data;
            toast.success(`${data?.email} with ${data?.role} Role is created`);
            reset();
        }
    }, [result]);

    return (
        <div className="p-4 w-[300px]">
            <h1 className="text-2xl font-bold">Role and Permission</h1>

            <form
                className="mt-12 flex flex-col space-y-6 w-full mx-auto "
                onSubmit={handleSubmit(onSubmit)}
            >
                <div className="flex flex-col space-y-2">
                    <label className="font-bold" htmlFor="email">
                        Google Account Email
                    </label>
                    <Input
                        {...register('email')}
                        name="email"
                        aria-invalid={!!errors.email}
                        label="Email"
                        type="email"
                    />
                    {errors.email && (
                        <p className="text-red-600 text-sm">
                            {errors.email.message}
                        </p>
                    )}
                </div>
                <div className="flex flex-col space-y-2">
                    <label className="font-bold" htmlFor="role">
                        Select Role
                    </label>
                    <Select
                        {...register('role')}
                        className="w-full"
                        name="role"
                        label="Select an role"
                    >
                        {RoleUser.map((role) => (
                            <SelectItem key={role}>{role}</SelectItem>
                        ))}
                    </Select>
                    {errors.role && (
                        <p className="text-red-600 text-sm">
                            {errors.role.message}
                        </p>
                    )}
                </div>

                <Button
                    color="primary"
                    type="submit"
                    disabled={isSubmitting || status === 'executing'}
                    className="cursor-pointer !bg-[#0D98FE]"
                >
                    {status === 'executing' ? (
                        <Spinner color="warning" size="sm" />
                    ) : (
                        'Create User'
                    )}
                </Button>
            </form>
        </div>
    );
};

export default RoleAndPermission;
