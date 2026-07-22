export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          PuckTree
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Follow every branch of a hockey trade.
        </p>
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <p className="text-gray-700 mb-4">
            <strong>Milestone 0: Provider Spike</strong>
          </p>
          <p className="text-gray-600 text-sm mb-4">
            The transaction provider and normalization contract are currently being validated.
            The full player search and trade tree interface will be implemented in Milestone 1.
          </p>
          <a
            href="/diagnostics"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Provider Diagnostics
          </a>
        </div>
        <div className="text-sm text-gray-500">
          <a href="https://github.com/yourusername/pucktree" className="hover:text-gray-700">
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
