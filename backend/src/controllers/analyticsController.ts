import { Request, Response } from 'express';
import { AudienceVisit } from '../models/AudienceVisit';
import {
  getClientIp,
  getDeviceIp,
  resolveGeoLocation,
  parseUserAgent,
  parseReferrerHost,
} from '../services/geoService';

export const trackVisit = async (req: Request, res: Response): Promise<void> => {
  const { path = '/', referrer = '', sessionId } = req.body as {
    path?: string;
    referrer?: string;
    sessionId?: string;
  };

  const userIp = getClientIp(req);
  const deviceIp = getDeviceIp(req);
  const userAgent = req.headers['user-agent'] ?? '';
  const geo = resolveGeoLocation(userIp);
  const device = parseUserAgent(userAgent);
  const referrerHost = parseReferrerHost(referrer);

  await AudienceVisit.create({
    userIp,
    deviceIp,
    ...geo,
    userAgent,
    ...device,
    path,
    referrer,
    referrerHost,
    user: req.user?.id,
    sessionId,
    visitedAt: new Date(),
  });

  res.status(201).json({ ok: true });
};

export const getAudienceAnalytics = async (req: Request, res: Response): Promise<void> => {
  const days = Math.min(90, parseInt(req.query.days as string, 10) || 30);
  const since = new Date();
  since.setDate(since.getDate() - days);

  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit as string, 10) || 25);
  const skip = (page - 1) * limit;

  const matchStage = { visitedAt: { $gte: since } };

  const [
    totalVisits,
    uniqueSessions,
    uniqueIps,
    byCountry,
    byCity,
    byReferrer,
    byDevice,
    byBrowser,
    dailyVisits,
    recentVisits,
  ] = await Promise.all([
    AudienceVisit.countDocuments(matchStage),
    AudienceVisit.distinct('sessionId', matchStage),
    AudienceVisit.distinct('userIp', matchStage),
    AudienceVisit.aggregate([
      { $match: matchStage },
      { $group: { _id: '$country', count: { $sum: 1 }, cities: { $addToSet: '$city' } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]),
    AudienceVisit.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { country: '$country', city: '$city' },
          count: { $sum: 1 },
          lat: { $first: '$latitude' },
          lng: { $first: '$longitude' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]),
    AudienceVisit.aggregate([
      { $match: matchStage },
      { $group: { _id: '$referrerHost', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]),
    AudienceVisit.aggregate([
      { $match: matchStage },
      { $group: { _id: '$deviceType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    AudienceVisit.aggregate([
      { $match: matchStage },
      { $group: { _id: '$browser', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    AudienceVisit.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$visitedAt' } },
          visits: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    AudienceVisit.find(matchStage)
      .populate('user', 'name email')
      .sort({ visitedAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);

  res.json({
    summary: {
      totalVisits,
      uniqueSessions: uniqueSessions.filter(Boolean).length,
      uniqueIps: uniqueIps.length,
      days,
    },
    byCountry: byCountry.map((c) => ({
      country: c._id,
      count: c.count,
      cityCount: c.cities?.length ?? 0,
    })),
    byCity: byCity.map((c) => ({
      country: c._id.country,
      city: c._id.city,
      count: c.count,
      latitude: c.lat,
      longitude: c.lng,
    })),
    byReferrer: byReferrer.map((r) => ({ source: r._id, count: r.count })),
    byDevice,
    byBrowser,
    dailyVisits,
    recentVisits,
    pagination: {
      page,
      limit,
      total: totalVisits,
      pages: Math.ceil(totalVisits / limit),
    },
  });
};

export const getAllVisits = async (req: Request, res: Response): Promise<void> => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.min(200, parseInt(req.query.limit as string, 10) || 50);
  const skip = (page - 1) * limit;
  const country = req.query.country as string | undefined;

  const filter: Record<string, unknown> = {};
  if (country) filter.country = country;

  const [visits, total] = await Promise.all([
    AudienceVisit.find(filter)
      .populate('user', 'name email')
      .sort({ visitedAt: -1 })
      .skip(skip)
      .limit(limit),
    AudienceVisit.countDocuments(filter),
  ]);

  res.json({
    visits,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};
