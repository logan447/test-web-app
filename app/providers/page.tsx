"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import MainNav from "@/components/Navigation/MainNav";

type Provider = {
  id: string;
  name: string;
  providerType: string;
  city: string;
  state: string;
  description: string | null;
  careTypesOffered: string[];
  licensed: boolean;
};

export default function ProvidersPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [providerType, setProviderType] = useState("");
  const [careType, setCareType] = useState("");
  const [requestedProviderIds, setRequestedProviderIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProviders();
    if (session) {
      fetchSentRequests();
    }
  }, [session]);

  const fetchSentRequests = async () => {
    try {
      const response = await fetch('/api/requests?type=sent');
      if (response.ok) {
        const requests = await response.json();
        const providerIds = new Set<string>(requests.map((req: any) => req.provider.id as string));
        setRequestedProviderIds(providerIds);
      }
    } catch (error) {
      console.error('Error fetching sent requests:', error);
    }
  };

  const fetchProviders = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (city) params.append("city", city);
    if (state) params.append("state", state);
    if (providerType) params.append("providerType", providerType);
    if (careType) params.append("careType", careType);

    const response = await fetch(`/api/providers?${params.toString()}`);
    const data = await response.json();
    setProviders(data);
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProviders();
  };

  const formatProviderType = (type: string) => {
    return type.split('_').map(word =>
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Care Providers</h1>
          <p className="text-gray-600">Browse our nationwide directory of elder care providers</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Provider name or keywords..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g., CA, NY"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider Type
                </label>
                <select
                  value={providerType}
                  onChange={(e) => setProviderType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Types</option>
                  <option value="HOME_CARE">Home Care</option>
                  <option value="HOME_HEALTH">Home Health</option>
                  <option value="ASSISTED_LIVING">Assisted Living</option>
                  <option value="INDEPENDENT_LIVING">Independent Living</option>
                  <option value="MEMORY_CARE">Memory Care</option>
                  <option value="NURSING_HOME">Nursing Home</option>
                  <option value="HOSPICE">Hospice</option>
                  <option value="REHABILITATION">Rehabilitation</option>
                  <option value="INDEPENDENT_CAREGIVER">Independent Caregiver</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Care Type
                </label>
                <select
                  value={careType}
                  onChange={(e) => setCareType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Care Types</option>
                  <option value="COMPANION_CARE">Companion Care</option>
                  <option value="PERSONAL_CARE">Personal Care</option>
                  <option value="SKILLED_NURSING">Skilled Nursing</option>
                  <option value="MEMORY_CARE">Memory Care</option>
                  <option value="HOSPICE_CARE">Hospice Care</option>
                  <option value="RESPITE_CARE">Respite Care</option>
                  <option value="LIVE_IN_CARE">Live-In Care</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCity("");
                  setState("");
                  setProviderType("");
                  setCareType("");
                  fetchProviders();
                }}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading providers...</p>
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 mb-4">No providers found. Try adjusting your search criteria.</p>
            <Link
              href="/dashboard"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Return to Dashboard
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <Link
                key={provider.id}
                href={`/providers/${provider.id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 relative"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{provider.name}</h3>
                  <div className="flex items-center gap-2">
                    {provider.licensed && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Licensed
                      </span>
                    )}
                    {requestedProviderIds.has(provider.id) && (
                      <span className="text-xs bg-blue-100 text-blue-800 font-medium px-3 py-1 rounded-full flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Request Sent
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-primary-600 mb-2">
                  {formatProviderType(provider.providerType)}
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  📍 {provider.city}, {provider.state}
                </p>
                {provider.description && (
                  <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                    {provider.description}
                  </p>
                )}
                {Array.isArray(provider.careTypesOffered) && provider.careTypesOffered.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {(provider.careTypesOffered || []).slice(0, 3).map((care) => (
                      <span
                        key={care}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {formatProviderType(care)}
                      </span>
                    ))}
                    {provider.careTypesOffered.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{provider.careTypesOffered.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        {providers.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Showing {providers.length} provider{providers.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
