'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });

      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      // console.log('data', data);

      localStorage.setItem('accessToken', data.data.accessToken);
      alert('Login success!');
      // Redirect to admin/cashier page
      window.location.href = '/admin/cashier';
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    //   <form
    //     onSubmit={handleLogin}
    //     className="flex flex-col gap-3 w-80 mx-auto mt-20"
    //   >
    //     <input
    //       value={email}
    //       onChange={(e) => setEmail(e.target.value)}
    //       placeholder="Email"
    //     />
    //     <input
    //       value={password}
    //       onChange={(e) => setPassword(e.target.value)}
    //       placeholder="Password"
    //       type="password"
    //     />
    //     <button type="submit">Login</button>
    //     {error && <p className="text-red-500">{error}</p>}
    //   </form>
    // );

    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#f6f8f6] dark:bg-[#112116] text-[#111713] dark:text-[#e8edea] antialiased">
      <div className="absolute inset-0 bg-[#f6f8f6]/80 dark:bg-[#112116]/80 backdrop-blur-sm" />
      <main className="relative z-10 w-full max-w-md p-6 md:p-8">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="bg-[#1dc956]/20 dark:bg-[#1dc956]/30 p-3 rounded-full mb-4">
            <div className="bg-[#1dc956] text-white p-3 rounded-full">
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.848 5.767a1.5 1.5 0 0 0-1.696 0l-5.38 3.587A1.5 1.5 0 0 0 5 10.57v6.053a1.5 1.5 0 0 0 2.057 1.342l4.31-1.724a.5.5 0 0 1 .496 0l4.31 1.724A1.5 1.5 0 0 0 19 16.623V10.57a1.5 1.5 0 0 0-.772-1.216l-5.38-3.587ZM17.5 16.05l-3.81-1.524a1.5 1.5 0 0 0-1.492 0L8.5 16.05V10.57l4.528-3.018a.5.5 0 0 1 .562 0L17.5 10.57v5.48Z" />
                <path d="m21.25 8.243-1.34-1.005a.5.5 0 0 0-.62.057L17.5 8.877v-2.1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v2.339a.5.5 0 0 0 .21.41l1.98 1.485a.5.5 0 0 0 .687-.14l1.43-2.476a.5.5 0 0 0-.057-.62Z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold">PetCare Clinic</h1>
          <p className="text-[#64876f] dark:text-[#89b09a] mt-2">
            Welcome back! Please sign in.
          </p>
        </div>

        <div className="bg-white dark:bg-[#1a2e22] rounded-lg shadow-sm border border-[#dce5df] dark:border-[#2c4c38] p-8">
          <form className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#64876f] dark:text-[#89b09a]"
              >
                Email or Username
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="email"
                  name="email"
                  placeholder="you@example.com"
                  className="block w-full rounded-lg border border-[#dce5df] dark:border-[#2c4c38] bg-[#eef1ef] dark:bg-[#112116] placeholder:text-[#64876f]/70 dark:placeholder:text-[#89b09a]/70 focus:border-[#1dc956] focus:ring-[#1dc956] focus:ring-opacity-50 transition duration-150 ease-in-out sm:text-sm h-12 px-4"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#64876f] dark:text-[#89b09a]"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  className="block w-full rounded-lg border border-[#dce5df] dark:border-[#2c4c38] bg-[#eef1ef] dark:bg-[#112116] placeholder:text-[#64876f]/70 dark:placeholder:text-[#89b09a]/70 focus:border-[#1dc956] focus:ring-[#1dc956] focus:ring-opacity-50 transition duration-150 ease-in-out sm:text-sm h-12 px-4"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <a
                href="#"
                className="text-sm font-medium text-[#1dc956] hover:text-[#1dc956]/80"
              >
                Forgot your password?
              </a>
            </div>

            <button
              type="submit"
              onClick={handleLogin}
              className="flex w-full justify-center rounded-lg bg-[#1dc956] py-3 px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#1dc956]/90 focus:outline-none focus:ring-2 focus:ring-[#1dc956] focus:ring-offset-2 transition-all duration-300"
            >
              Log in
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-sm text-[#64876f] dark:text-[#89b09a]">
          Don&apos;t have an account?{' '}
          <a
            href="#"
            className="font-medium text-[#1dc956] hover:text-[#1dc956]/80"
          >
            Sign up
          </a>
        </p>
      </main>
    </div>
  );
}
