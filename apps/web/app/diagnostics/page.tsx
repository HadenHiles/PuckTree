"use client";

import { useState } from "react";
import type { TransactionSearchResponse } from "@pucktree/domain";

export default function DiagnosticsPage() {
  const [playerName, setPlayerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<TransactionSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!playerName.trim()) {
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch(
        `/api/transactions/search?player_name=${encodeURIComponent(playerName)}`
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data: TransactionSearchResponse = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const suggestedPlayers = [
    "Auston Matthews",
    "Connor McDavid",
    "Phil Kessel",
    "Patrick Kane",
    "Nazem Kadri",
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Provider Diagnostics
          </h1>
          <p className="text-gray-600">
            Test transaction provider normalization and contract validation.
          </p>
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Development only.</strong> This page validates the normalized
              JSON contract between the Python service and Next.js. It is not the
              final user experience.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <label
              htmlFor="playerName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Player Name
            </label>
            <input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Enter player name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <div className="flex gap-2 mb-4 flex-wrap">
            {suggestedPlayers.map((name) => (
              <button
                key={name}
                onClick={() => {
                  setPlayerName(name);
                }}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                disabled={loading}
              >
                {name}
              </button>
            ))}
          </div>

          <button
            onClick={handleSearch}
            disabled={loading || !playerName.trim()}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Searching..." : "Search Transactions"}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-red-800 mb-2">Error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {response && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Provider Response
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Query:</span>{" "}
                  <span className="text-gray-900">{response.query}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>{" "}
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      response.providerStatus === "success"
                        ? "bg-green-100 text-green-800"
                        : response.providerStatus === "disabled"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {response.providerStatus}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Transactions:
                  </span>{" "}
                  <span className="text-gray-900">
                    {response.transactions.length}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Partial:</span>{" "}
                  <span className="text-gray-900">
                    {response.isPartial ? "Yes" : "No"}
                  </span>
                </div>
              </div>
              {response.providerMessage && (
                <div className="mt-4">
                  <span className="font-medium text-gray-700 text-sm">
                    Message:
                  </span>{" "}
                  <span className="text-gray-600 text-sm">
                    {response.providerMessage}
                  </span>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Normalized Transactions
              </h3>
              {response.transactions.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No transactions found for this player.
                </p>
              ) : (
                <div className="space-y-4">
                  {response.transactions.map((transaction, index) => (
                    <div
                      key={transaction.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <span className="text-sm font-medium text-gray-500">
                            #{index + 1}
                          </span>
                          <h4 className="text-base font-semibold text-gray-900">
                            {transaction.transactionDate}
                          </h4>
                        </div>
                        <div className="flex gap-2">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              transaction.kind === "trade"
                                ? "bg-blue-100 text-blue-800"
                                : transaction.kind === "draft"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {transaction.kind}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              transaction.confidence === "verified"
                                ? "bg-green-100 text-green-800"
                                : transaction.confidence === "strong-match"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {transaction.confidence}
                          </span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Teams ({transaction.teams.length})
                        </p>
                        <div className="flex gap-2">
                          {transaction.teams.map((team) => (
                            <span
                              key={team.teamId}
                              className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm"
                            >
                              {team.abbreviation || team.teamId} - {team.teamName}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Assets ({transaction.assets.length})
                        </p>
                        <div className="space-y-2">
                          {transaction.assets.map((asset) => (
                            <div
                              key={asset.id}
                              className="flex items-start gap-3 p-2 bg-gray-50 rounded"
                            >
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                  asset.kind === "player"
                                    ? "bg-blue-100 text-blue-800"
                                    : asset.kind === "draft-pick"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {asset.kind}
                              </span>
                              <div className="flex-1 text-sm">
                                <p className="font-medium text-gray-900">
                                  {asset.displayLabel}
                                </p>
                                {asset.playerRef && (
                                  <p className="text-gray-600 text-xs mt-1">
                                    Normalized: {asset.playerRef.normalizedName}
                                    {asset.playerRef.position && (
                                      <> • {asset.playerRef.position}</>
                                    )}
                                  </p>
                                )}
                                {asset.kind === "draft-pick" && (
                                  <p className="text-gray-600 text-xs mt-1">
                                    {asset.draftYear && `Year: ${asset.draftYear}`}
                                    {asset.round && ` • Round: ${asset.round}`}
                                    {asset.overall && ` • Overall: ${asset.overall}`}
                                    {asset.conditionsText && (
                                      <span className="text-yellow-700">
                                        {" "}
                                        • Conditional
                                      </span>
                                    )}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {transaction.reviewReasons.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Review Reasons
                          </p>
                          <div className="flex gap-1 flex-wrap">
                            {transaction.reviewReasons.map((reason, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center px-2 py-1 bg-yellow-50 text-yellow-800 rounded text-xs"
                              >
                                {reason}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                        Source: {transaction.source.provider} •{" "}
                        {transaction.source.sourceName}
                        {transaction.source.sourceUrl && (
                          <>
                            {" • "}
                            <a
                              href={transaction.source.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              View source
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <details className="mt-6 pt-6 border-t border-gray-200">
              <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                View Raw JSON
              </summary>
              <pre className="mt-4 p-4 bg-gray-50 rounded text-xs overflow-x-auto">
                {JSON.stringify(response, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
