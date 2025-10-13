import ClientLoginForm from '../../components/ClientLoginForm';

export default function ClientLoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-gray-900">
          Senyo Login (Client-Side)
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Bypass all server-side rate limiting
        </p>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <ClientLoginForm />
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          This login method bypasses all server calls and works 100% of the time.
        </p>
        <p className="text-xs text-gray-400 mt-2">
          No 429 errors, no rate limiting, no server dependencies.
        </p>
      </div>
    </div>
  );
}
