import { UserInfo } from '../context/AuthContext';
import { Capacitor } from '@capacitor/core';
import { CapacitorHttp } from '@capacitor/core';

const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const buildApiUrl = (user: UserInfo, action: string, params: Record<string, string> = {}) => {
  const url = new URL(`${user.serverUrl}/player_api.php`);
  url.searchParams.append('username', user.username);
  if (user.password) {
    url.searchParams.append('password', user.password);
  }
  url.searchParams.append('action', action);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  return url.toString();
};

export const fetchApi = async (user: UserInfo, action: string, params: Record<string, string> = {}) => {
  const url = buildApiUrl(user, action, params);
  
  // Check cache
  if (cache[url] && Date.now() - cache[url].timestamp < CACHE_DURATION) {
    return cache[url].data;
  }

  try {
    let data;
    if (Capacitor.isNativePlatform()) {
      // Use CapacitorHttp to bypass CORS on native devices
      const options = {
        url: url,
        headers: { 'Content-Type': 'application/json' },
      };
      const response = await CapacitorHttp.get(options);
      if (response.status >= 400) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      data = response.data;
    } else {
      // Use proxy for web
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      data = await response.json();
    }
    
    // Update cache
    cache[url] = { data, timestamp: Date.now() };
    return data;
  } catch (error) {
    console.error(`API Error (${action}):`, error);
    throw error;
  }
};

export const getLiveCategories = (user: UserInfo) => fetchApi(user, 'get_live_categories');
export const getLiveStreams = (user: UserInfo, categoryId?: string) => {
  const params = categoryId ? { category_id: categoryId } : {};
  return fetchApi(user, 'get_live_streams', params);
};

export const getVodCategories = (user: UserInfo) => fetchApi(user, 'get_vod_categories');
export const getVodStreams = (user: UserInfo, categoryId?: string) => {
  const params = categoryId ? { category_id: categoryId } : {};
  return fetchApi(user, 'get_vod_streams', params);
};
export const getVodInfo = (user: UserInfo, vodId: string) => fetchApi(user, 'get_vod_info', { vod_id: vodId });

export const getSeriesCategories = (user: UserInfo) => fetchApi(user, 'get_series_categories');
export const getSeries = (user: UserInfo, categoryId?: string) => {
  const params = categoryId ? { category_id: categoryId } : {};
  return fetchApi(user, 'get_series', params);
};
export const getSeriesInfo = (user: UserInfo, seriesId: string) => fetchApi(user, 'get_series_info', { series_id: seriesId });

export const getStreamUrl = (user: UserInfo, type: 'live' | 'movie' | 'series', id: string, extension: string = 'm3u8') => {
  let typePath = '';
  if (type === 'live') typePath = 'live';
  else if (type === 'movie') typePath = 'movie';
  else if (type === 'series') typePath = 'series';
  
  const originalUrl = `${user.serverUrl}/${typePath}/${user.username}/${user.password}/${id}.${extension}`;
  
  // Use proxy for web to bypass Mixed Content (HTTPS -> HTTP) and CORS
  if (!Capacitor.isNativePlatform()) {
    return `/api/stream?url=${encodeURIComponent(originalUrl)}`;
  }
  
  return originalUrl;
};
