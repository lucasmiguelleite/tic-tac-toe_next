'use client'
import { redirect } from "next/navigation"

export default function NotFound() {
  return (
    <div>
      <h1 className='font-bold text-4xl my-10 text-center'>Page Not Found!</h1>
      <div className='flex flex-nowrap justify-center'>
        <button className='border rounded-full mr-2 mb-2 text-center w-52 h-16 hover:bg-gray-600 hover:text-white' onClick={() => redirect("/")}>Go back to Home</button>
      </div>
  </div>
  );
}
