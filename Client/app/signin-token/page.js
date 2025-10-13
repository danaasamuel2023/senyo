import TokenSigninForm from '../../components/TokenSigninForm';

export default function TokenSigninPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-gray-900">
          Senyo Token-Based Signin
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Secure JWT token authentication
        </p>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <TokenSigninForm />
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          This signin method uses JWT tokens for secure authentication.
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Tokens are automatically generated, validated, and refreshed.
        </p>
      </div>
    </div>
  );
}
