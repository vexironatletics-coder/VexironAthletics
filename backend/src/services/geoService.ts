import { Request } from 'express';
import geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';

export interface GeoLocation {
  country: string;
  city: string;
  region: string;
  timezone: string;
  latitude?: number;
  longitude?: number;
}

export const getClientIp = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].split(',')[0].trim();
  }
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string') return realIp;
  return req.ip ?? req.socket.remoteAddress ?? 'unknown';
};

export const getDeviceIp = (req: Request): string =>
  req.socket.remoteAddress?.replace('::ffff:', '') ?? 'unknown';

export const resolveGeoLocation = (ip: string): GeoLocation => {
  const cleanIp = ip.replace('::ffff:', '');

  if (
    cleanIp === '127.0.0.1' ||
    cleanIp === '::1' ||
    cleanIp === 'unknown' ||
    cleanIp.startsWith('192.168.') ||
    cleanIp.startsWith('10.')
  ) {
    return {
      country: 'Local / Private',
      city: 'Development',
      region: 'Local',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      latitude: 0,
      longitude: 0,
    };
  }

  const geo = geoip.lookup(cleanIp);
  if (!geo) {
    return {
      country: 'Unknown',
      city: 'Unknown',
      region: '',
      timezone: '',
    };
  }

  return {
    country: geo.country ?? 'Unknown',
    city: geo.city ?? 'Unknown',
    region: geo.region ?? '',
    timezone: geo.timezone ?? '',
    latitude: geo.ll?.[0],
    longitude: geo.ll?.[1],
  };
};

export const parseUserAgent = (userAgent: string) => {
  const parser = new UAParser(userAgent);
  const device = parser.getDevice();
  const browser = parser.getBrowser();
  const os = parser.getOS();

  return {
    deviceType: device.type ?? 'desktop',
    browser: [browser.name, browser.version].filter(Boolean).join(' ') || 'Unknown',
    os: [os.name, os.version].filter(Boolean).join(' ') || 'Unknown',
  };
};

export const parseReferrerHost = (referrer: string): string => {
  if (!referrer) return 'direct';
  try {
    return new URL(referrer).hostname.replace('www.', '');
  } catch {
    return 'unknown';
  }
};
