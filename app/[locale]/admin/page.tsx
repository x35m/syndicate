import Link from 'next/link';

async function getStats() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/countries`,
      { cache: 'no-store' }
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return null;
  }
}

export default async function AdminPage() {
  const stats = await getStats();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-2 text-gray-600">Manage your news aggregation platform</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500">Countries</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stats.count}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Sources</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats.countries?.reduce((sum: number, c: any) => sum + c.stats.sources, 0) || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Articles</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats.countries?.reduce((sum: number, c: any) => sum + c.stats.articles, 0) || 0}
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link 
          href="/admin/import"
          className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900">RSS Import</h3>
          <p className="mt-2 text-gray-600">Import articles from RSS feeds</p>
        </Link>

        <Link 
          href="/admin/sources"
          className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900">Manage Sources</h3>
          <p className="mt-2 text-gray-600">Add, edit, or remove RSS sources</p>
        </Link>

        <Link 
          href="/admin/articles"
          className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900">View Articles</h3>
          <p className="mt-2 text-gray-600">Browse and manage imported articles</p>
        </Link>

        <Link 
          href="/admin/countries"
          className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900">Manage Countries</h3>
          <p className="mt-2 text-gray-600">Configure countries and languages</p>
        </Link>
      </div>
    </div>
  );
}

