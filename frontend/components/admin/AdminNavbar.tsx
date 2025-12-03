'use client'
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// ฟังก์ชัน decode JWT อย่างง่าย (ไม่ต้องใช้ external lib)
function decodeJWT(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token');
    }
    // const headerBase64 = parts[0];
    const payloadBase64 = parts[1];
    // const header = JSON.parse(atob(headerBase64));
    const payload = JSON.parse(atob(payloadBase64));
    return payload;
  } catch (e) {
    console.error("Invalid token", e);
    return null;
  }
}

const AdminNavbar = () => {
  const [username, setUsername] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    // console.log("token",token)
    if (token) {
      const decoded = decodeJWT(token)
      console.log("decoded token:", decoded)
      if (decoded && decoded.name) {
        setUsername(decoded.name)
      }
    } else {
      window.location.href = '/login';
      throw new Error('Please login')
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    setUsername(null)
    router.push('/login')
  }

  return (
    <div className="flex items-center justify-between px-12 py-3 border-b border-slate-200 transition-all">
      <Link href="/" className="relative text-4xl font-semibold text-slate-700">
        <span className="text-green-600">Cos</span>M<span className="text-green-600 text-5xl leading-0">.</span>
        <p className="absolute text-xs font-semibold -top-1 -right-13 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
          Admin
        </p>
      </Link>

      <div className="flex items-center gap-3">
        {username ? (
          <>
            <p>Hi, {username}</p>
            <button
              onClick={handleLogout}
              className="text-sm font-semibold text-red-500 hover:text-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="text-sm font-semibold text-green-600 hover:text-green-700"
          >
            Login
          </Link>
        )}
      </div>
    </div>
  )
}

export default AdminNavbar
