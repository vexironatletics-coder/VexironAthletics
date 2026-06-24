'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { useGetAudienceAnalyticsQuery } from '@/store/api/analyticsApi';
import { useGetUserStatsQuery } from '@/store/api/userApi';
import { formatPrice } from '@/lib/utils';
import { Globe, MapPin, Users, Monitor, UserCheck, ShoppingBag, TrendingUp, UserPlus } from 'lucide-react';

function BarRow({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="truncate font-medium">{label}</span>
        <span className="text-zinc-500">{count}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--border)]">
        <div
          className="h-full rounded-full bg-[var(--primary)] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function AdminAudiencePage() {
  const [days, setDays] = useState(30);
  const { data, isLoading } = useGetAudienceAnalyticsQuery({ days, page: 1 });
  const { data: userStats, isLoading: loadingUsers } = useGetUserStatsQuery();

  const maxCountry = data?.byCountry[0]?.count ?? 1;
  const maxReferrer = data?.byReferrer[0]?.count ?? 1;
  const maxCity = data?.byCity[0]?.count ?? 1;

  return (
    <ErrorBoundary>
      <div className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Audience Analytics</h1>
              <p className="mt-1 text-sm text-zinc-500">
                Track where visitors come from, their location, device, and IP
              </p>
            </div>
            <select
              className="rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>

          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: 'Total visits', value: data?.summary.totalVisits ?? 0, icon: Globe },
                  { label: 'Unique sessions', value: data?.summary.uniqueSessions ?? 0, icon: Users },
                  { label: 'Unique IPs', value: data?.summary.uniqueIps ?? 0, icon: Monitor },
                  { label: 'Countries', value: data?.byCountry.length ?? 0, icon: MapPin },
                ].map(({ label, value, icon: Icon }) => (
                  <Card key={label}>
                    <CardContent className="flex items-center gap-4 pt-6">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm text-zinc-500">{label}</p>
                        <p className="text-2xl font-bold">{value}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle>Top Countries</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {data?.byCountry.length ? (
                      data.byCountry.map((c) => (
                        <BarRow key={c.country} label={c.country} count={c.count} max={maxCountry} />
                      ))
                    ) : (
                      <p className="text-sm text-zinc-500">No data yet</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Traffic Sources</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {data?.byReferrer.length ? (
                      data.byReferrer.map((r) => (
                        <BarRow key={r.source} label={r.source} count={r.count} max={maxReferrer} />
                      ))
                    ) : (
                      <p className="text-sm text-zinc-500">No data yet</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Top Cities</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {data?.byCity.length ? (
                      data.byCity.map((c) => (
                        <BarRow
                          key={`${c.country}-${c.city}`}
                          label={`${c.city}, ${c.country}`}
                          count={c.count}
                          max={maxCity}
                        />
                      ))
                    ) : (
                      <p className="text-sm text-zinc-500">No data yet</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Devices & Browsers</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-xs font-medium uppercase text-zinc-400">Devices</p>
                    {data?.byDevice.map((d) => (
                      <div key={d._id} className="flex justify-between text-sm">
                        <span className="capitalize">{d._id}</span>
                        <Badge variant="secondary">{d.count}</Badge>
                      </div>
                    ))}
                    <p className="pt-2 text-xs font-medium uppercase text-zinc-400">Browsers</p>
                    {data?.byBrowser.map((b) => (
                      <div key={b._id} className="flex justify-between text-sm">
                        <span>{b._id}</span>
                        <Badge variant="secondary">{b.count}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Visitor Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-sm">
                      <thead>
                        <tr className="border-b text-left text-xs uppercase text-zinc-500">
                          <th className="py-2 pr-4">Time</th>
                          <th className="py-2 pr-4">User IP</th>
                          <th className="py-2 pr-4">Device IP</th>
                          <th className="py-2 pr-4">Country</th>
                          <th className="py-2 pr-4">City</th>
                          <th className="py-2 pr-4">Location</th>
                          <th className="py-2 pr-4">Device</th>
                          <th className="py-2 pr-4">Source</th>
                          <th className="py-2">Page</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data?.recentVisits.map((visit) => (
                          <tr key={visit._id} className="border-b border-zinc-100 dark:border-zinc-800">
                            <td className="py-2 pr-4 whitespace-nowrap">
                              {new Date(visit.visitedAt).toLocaleString()}
                            </td>
                            <td className="py-2 pr-4 font-mono text-xs">{visit.userIp}</td>
                            <td className="py-2 pr-4 font-mono text-xs">{visit.deviceIp}</td>
                            <td className="py-2 pr-4">{visit.country}</td>
                            <td className="py-2 pr-4">{visit.city}</td>
                            <td className="py-2 pr-4 font-mono text-xs">
                              {visit.latitude != null && visit.longitude != null
                                ? `${visit.latitude.toFixed(4)}, ${visit.longitude.toFixed(4)}`
                                : '—'}
                            </td>
                            <td className="py-2 pr-4">
                              <span className="capitalize">{visit.deviceType}</span>
                              <br />
                              <span className="text-xs text-zinc-500">{visit.browser}</span>
                            </td>
                            <td className="py-2 pr-4">{visit.referrerHost}</td>
                            <td className="py-2">{visit.path}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!data?.recentVisits.length && (
                      <p className="py-8 text-center text-zinc-500">
                        No visits recorded yet. Browse the shop to collect data.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* ── Registered Users Section ── */}
              <div>
                <h2 className="mb-4 text-xl font-bold">Registered Users</h2>
                {loadingUsers ? (
                  <Skeleton className="h-40 w-full" />
                ) : (
                  <>
                    <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        { label: 'Total Registered', value: userStats?.totalUsers ?? 0, icon: Users },
                        { label: 'New This Week', value: userStats?.newThisWeek ?? 0, icon: UserPlus },
                        { label: 'Active Buyers', value: userStats?.users.filter((u) => u.totalOrders > 0).length ?? 0, icon: ShoppingBag },
                        { label: 'Avg. Spend / Buyer', value: (() => {
                            const buyers = userStats?.users.filter((u) => u.totalOrders > 0) ?? [];
                            if (!buyers.length) return formatPrice(0);
                            return formatPrice(buyers.reduce((s, u) => s + u.totalSpent, 0) / buyers.length);
                          })(), icon: TrendingUp, isPrice: true },
                      ].map(({ label, value, icon: Icon }) => (
                        <Card key={label}>
                          <CardContent className="flex items-center gap-4 pt-6">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--secondary)]/30">
                              <Icon className="h-5 w-5 text-[var(--primary)]" />
                            </div>
                            <div>
                              <p className="text-sm text-zinc-500">{label}</p>
                              <p className="text-2xl font-bold">{value}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Card>
                      <CardHeader><CardTitle>User Details</CardTitle></CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[800px] text-sm">
                            <thead>
                              <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-zinc-500">
                                <th className="py-2 pr-4">User</th>
                                <th className="py-2 pr-4">Role</th>
                                <th className="py-2 pr-4">Status</th>
                                <th className="py-2 pr-4">Joined</th>
                                <th className="py-2 pr-4">Orders</th>
                                <th className="py-2 pr-4">Total Spent</th>
                                <th className="py-2 pr-4">Last Order</th>
                                <th className="py-2">Points</th>
                              </tr>
                            </thead>
                            <tbody>
                              {userStats?.users.map((u) => (
                                <tr key={u.id} className="border-b border-[var(--border)]">
                                  <td className="py-3 pr-4">
                                    <div className="flex items-center gap-3">
                                      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[var(--secondary)]/40">
                                        {u.avatar ? (
                                          <Image src={u.avatar} alt={u.name} fill className="object-cover" sizes="32px" unoptimized />
                                        ) : (
                                          <UserCheck className="m-auto h-4 w-4 text-zinc-400" />
                                        )}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="truncate font-medium">{u.name}</p>
                                        <p className="truncate text-xs text-zinc-500">{u.email}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 pr-4">
                                    <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                                      {u.role}
                                    </Badge>
                                  </td>
                                  <td className="py-3 pr-4">
                                    <span className={`inline-flex h-5 items-center rounded-full px-2 text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                                      {u.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                  </td>
                                  <td className="py-3 pr-4 text-xs text-zinc-500">
                                    {new Date(u.joinedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                  </td>
                                  <td className="py-3 pr-4">
                                    <span className="font-semibold">{u.totalOrders}</span>
                                  </td>
                                  <td className="py-3 pr-4 font-medium">{formatPrice(u.totalSpent)}</td>
                                  <td className="py-3 pr-4 text-xs text-zinc-500">
                                    {u.lastOrderAt ? new Date(u.lastOrderAt).toLocaleDateString() : '—'}
                                  </td>
                                  <td className="py-3 text-xs font-medium text-[var(--accent)]">
                                    {u.loyaltyPoints} pts
                                  </td>
                                </tr>
                              ))}
                              {!userStats?.users.length && (
                                <tr>
                                  <td colSpan={8} className="py-8 text-center text-zinc-500">No registered users yet.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </>
          )}
      </div>
    </ErrorBoundary>
  );
}
