"use client";
import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; 
import { UserContext } from '@/context/userContext';

const UserAuth = ({ children }) => {

    const { user } = useContext(UserContext);
    const [ loading, setLoading ] = useState(true);
    const token = localStorage.getItem('token');
    const router = useRouter();

    useEffect(() => {
        if (user) {
            setLoading(false);
        }

        if (!token) {
            router.push('/login');
        }

        if (!user) {
            router.push('/login');
        }

    }, [])

    if (loading) {
        return <div>Loading...</div>
    }


    return (
        <>
            {children}</>
    )
}

export default UserAuth;