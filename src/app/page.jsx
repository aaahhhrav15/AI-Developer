"use client";
 
import { useContext } from 'react';
import { UserContext } from '@/context/userContext';

const page = () => {

  const { user } = useContext(UserContext);
  return (
    <div>{JSON.stringify(user)}</div>
  )
}

export default page;