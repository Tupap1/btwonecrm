import React, { useEffect, useState, useRef } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  IconPin,
  IconCheck,
  IconMap,
  IconPlayerPlay,
  IconTrash,
  IconPlus,
  IconArrowUpRight,
  IconHeadphones,
  IconPhoto,
  IconLoader,
  IconEdit,
  IconSquareCheck,
} from 'twenty-ui/icon';

import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import {
  OPTIMIZE_ROUTE,
  GET_ROUTES,
  CREATE_ROUTE,
  UPDATE_ROUTE,
  DELETE_ROUTE,
  GET_ALL_STOP_COORDINATES,
  SAVE_STOP_COORDINATES,
  CHECK_IN,
  CHECK_OUT,
} from '@/field-sales/graphql/fieldSalesQueries';

// --- STYLED COMPONENTS ---

const StyledContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
  background-color: ${themeCssVariables.background.primary};
  font-family: inherit;
  color: ${themeCssVariables.font.color.primary};
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
  }
`;

const StyledLeftPanel = styled.div`
  width: 420px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${themeCssVariables.background.secondary};
  border-right: 1px solid ${themeCssVariables.border.color.light};
  z-index: 10;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    width: 100%;
    height: 50%;
  }
`;

const StyledMapArea = styled.div`
  flex: 1;
  height: 100%;
  position: relative;
  background-color: #e5e5f7;

  @media (max-width: 768px) {
    height: 50%;
  }
`;

const StyledHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  background-color: ${themeCssVariables.background.primary};
`;

const StyledTitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
`;

const StyledTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: ${themeCssVariables.font.color.primary};
`;

const StyledBadge = styled.span`
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StyledSubtitle = styled.p`
  font-size: 13px;
  color: ${themeCssVariables.font.color.light};
  margin: 0;
`;

const StyledContentScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const StyledSectionCard = styled.div`
  background-color: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
`;

const StyledSectionTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledFormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
`;

const StyledLabel = styled.label`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: ${themeCssVariables.font.color.light};
`;

const StyledInput = styled.input`
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid ${themeCssVariables.border.color.medium};
  background-color: ${themeCssVariables.background.primary};
  color: ${themeCssVariables.font.color.primary};
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #6366f1;
  }
`;

const StyledSelect = styled.select`
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid ${themeCssVariables.border.color.medium};
  background-color: ${themeCssVariables.background.primary};
  color: ${themeCssVariables.font.color.primary};
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #6366f1;
  }
`;

const StyledStopList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const StyledStopCard = styled.div<{ active?: boolean; checkedIn?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid ${props => (props.active ? '#6366f1' : themeCssVariables.border.color.light)};
  background-color: ${props => (props.checkedIn ? 'rgba(34, 197, 94, 0.05)' : props.active ? 'rgba(99, 102, 241, 0.02)' : themeCssVariables.background.primary)};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #6366f1;
    transform: translateY(-1px);
  }
`;

const StyledStopIndex = styled.span<{ checkedIn?: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${props => (props.checkedIn ? '#22c55e' : '#6366f1')};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
`;

const StyledStopInfo = styled.div`
  flex: 1;
  margin-left: 12px;
`;

const StyledStopName = styled.div`
  font-size: 13px;
  font-weight: 600;
`;

const StyledStopMeta = styled.div`
  font-size: 11px;
  color: ${themeCssVariables.font.color.light};
  margin-top: 2px;
`;

const StyledButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  width: 100%;

  background-color: ${props => {
    if (props.variant === 'primary') return '#6366f1';
    if (props.variant === 'danger') return '#ef4444';
    return themeCssVariables.background.tertiary;
  }};
  
  color: ${props => {
    if (props.variant === 'primary' || props.variant === 'danger') return 'white';
    return themeCssVariables.font.color.primary;
  }};

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StyledButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 10px;
`;

const StyledMetricsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 12px;
`;

const StyledMetricCell = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  padding: 10px;
  border-radius: 8px;
  text-align: center;
  border: 1px solid ${themeCssVariables.border.color.light};
`;

const StyledMetricVal = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #6366f1;
`;

const StyledMetricLbl = styled.div`
  font-size: 9px;
  color: ${themeCssVariables.font.color.light};
  text-transform: uppercase;
  margin-top: 2px;
`;

// --- DIALOG / BOTTOM SHEET ---

const StyledOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const StyledModal = styled.div`
  background-color: ${themeCssVariables.background.primary};
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 460px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const StyledModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  margin: 0;
`;

const StyledAudioVisualizer = styled.div`
  height: 48px;
  background-color: #f3f4f6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  overflow: hidden;
  padding: 0 16px;
`;

const StyledWaveBar = styled.div<{ active?: boolean; heightPercent?: number }>`
  width: 3px;
  height: ${props => (props.active ? `${props.heightPercent}%` : '20%')};
  background-color: #6366f1;
  border-radius: 2px;
  transition: height 0.1s ease;
`;

const StyledOSRMOfflineWarning = styled.div`
  font-size: 11px;
  color: #d97706;
  background-color: #fffbeb;
  border: 1px solid #fef3c7;
  padding: 8px;
  border-radius: 6px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StyledMapControls = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StyledThemeButton = styled.button<{ active?: boolean }>`
  background-color: ${props => props.active ? '#6366f1' : 'white'};
  color: ${props => props.active ? 'white' : '#374151'};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 11px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  font-family: inherit;
  &:hover {
    background-color: ${props => props.active ? '#6366f1' : '#f9fafb'};
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(0);
  }
`;

const StyledLocateButton = styled.button`
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: white;
  border: 1px solid ${themeCssVariables.border.color.medium};
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #374151;
  transition: all 0.2s ease;
  &:hover {
    background-color: #f9fafb;
    transform: scale(1.05);
  }
  &:active {
    transform: scale(0.95);
  }
`;

// --- COMPONENT IMPLEMENTATION ---

interface LeafletWindow extends Window {
  L?: any;
  tempMarker?: any;
  latestClickCoords?: { lat: number; lng: number };
  latestClickAddress?: string;
}

declare const window: LeafletWindow;

export const FieldSalesPage = () => {
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [routePolyline, setRoutePolyline] = useState<any>(null);
  const [markersList, setMarkersList] = useState<any[]>([]);

  // Local/Core State
  const [routesList, setRoutesList] = useState<any[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [currentRoute, setCurrentRoute] = useState<any>(null);
  const [routeName, setRouteName] = useState('New Sales Route');
  const [routeDate, setRouteDate] = useState(new Date().toISOString().split('T')[0]);
  const [routeStops, setRouteStops] = useState<any[]>([]); // Ordered array of stop object models
  const [allStopCoords, setAllStopCoords] = useState<any[]>([]);

  // Search/Add Stop State
  const [availableTargets, setAvailableTargets] = useState<any[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [osrmStatus, setOsrmStatus] = useState<'online' | 'offline'>('online');

  // CheckIn/CheckOut modal State
  const [activeCheckInStop, setActiveCheckInStop] = useState<any>(null);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioWaves, setAudioWaves] = useState<number[]>([]);
  const [checkInNotes, setCheckInNotes] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceVerification, setDistanceVerification] = useState<number | null>(null);

  // Phase 2: Map Customizations, Contact Creation & Geolocation Start Point
  const [mapTheme, setMapTheme] = useState<'apple-light' | 'dark' | 'satellite' | 'standard'>('apple-light');
  const tileLayerRef = useRef<any>(null);
  
  const [isCreateContactModalOpen, setIsCreateContactModalOpen] = useState(false);
  const [clickCoords, setClickCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactType, setNewContactType] = useState<'PERSON' | 'COMPANY'>('PERSON');
  const [newContactAddress, setNewContactAddress] = useState('');

  const { createOneRecord: createPersonRecord } = useCreateOneRecord({ objectNameSingular: 'person' });
  const { createOneRecord: createCompanyRecord } = useCreateOneRecord({ objectNameSingular: 'company' });

  // Fetch Companies & People from CRM dynamic store
  const { records: companiesData } = useFindManyRecords({ objectNameSingular: 'company' });
  const { records: peopleData } = useFindManyRecords({ objectNameSingular: 'person' });

  // Apollo queries/mutations
  const { data: routesQueryData, refetch: refetchRoutes } = useQuery<any>(GET_ROUTES);
  const { data: coordsQueryData, refetch: refetchCoords } = useQuery<any>(GET_ALL_STOP_COORDINATES);

  const [optimizeRouteMutation, { loading: optimizingLoading }] = useMutation<any>(OPTIMIZE_ROUTE);
  const [createRouteMutation] = useMutation<any>(CREATE_ROUTE);
  const [updateRouteMutation] = useMutation<any>(UPDATE_ROUTE);
  const [deleteRouteMutation] = useMutation<any>(DELETE_ROUTE);
  const [saveStopCoordsMutation] = useMutation<any>(SAVE_STOP_COORDINATES);
  const [checkInMutation, { loading: checkInLoading }] = useMutation<any>(CHECK_IN);
  const [checkOutMutation, { loading: checkOutLoading }] = useMutation<any>(CHECK_OUT);

  // Load Leaflet dynamically from CDN to avoid bundler dependency bugs with asset icons
  useEffect(() => {
    if (window.L) {
      setLeafletLoaded(true);
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setLeafletLoaded(true);
    document.body.appendChild(script);
  }, []);

  // Update Routes list from database
  useEffect(() => {
    if (routesQueryData?.getRoutes) {
      setRoutesList(routesQueryData.getRoutes);
    }
  }, [routesQueryData]);

  // Update stop coordinates list
  useEffect(() => {
    if (coordsQueryData?.getAllStopCoordinates) {
      setAllStopCoords(coordsQueryData.getAllStopCoordinates);
    }
  }, [coordsQueryData]);

  // Merge Companies and People into selectable stop targets
  useEffect(() => {
    const list: any[] = [];
    if (companiesData) {
      companiesData.forEach((c: any) => {
        list.push({
          id: c.id,
          name: c.name || 'Unnamed Company',
          type: 'COMPANY',
          address: c.address ? `${c.address.street || ''} ${c.address.city || ''}`.trim() : 'New York, NY',
        });
      });
    }
    if (peopleData) {
      peopleData.forEach((p: any) => {
        list.push({
          id: p.id,
          name: `${p.name?.firstName || ''} ${p.name?.lastName || ''}`.trim() || 'Unnamed Person',
          type: 'PERSON',
          address: p.address ? `${p.address.street || ''} ${p.address.city || ''}`.trim() : 'San Francisco, CA',
        });
      });
    }
    setAvailableTargets(list);
  }, [companiesData, peopleData]);

  // Map Initialization & Event Listeners
  useEffect(() => {
    if (!leafletLoaded || !document.getElementById('sales-map') || mapInstance) return;

    // Centered around New York City
    const map = window.L.map('sales-map').setView([40.7128, -74.006], 13);
    
    // Set tile layer according to current mapTheme
    const themeUrls = {
      'apple-light': 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      'dark': 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      'satellite': 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      'standard': 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    };

    const tileLayer = window.L.tileLayer(themeUrls[mapTheme], {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    setMapInstance(map);

    // Click on map listener to drop a temporary pin and offer Contact Creation
    map.on('click', async (e: any) => {
      const { lat, lng } = e.latlng;
      
      // Remove previous temp marker if any
      if (window.tempMarker) {
        window.tempMarker.remove();
      }

      // Add temporary marker
      const tempIcon = window.L.divIcon({
        className: 'temp-marker',
        html: `<div style="background-color: #ef4444; border: 2px solid white; border-radius: 50%; width: 14px; height: 14px; box-shadow: 0 0 8px rgba(239, 68, 68, 0.8);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const marker = window.L.marker([lat, lng], { icon: tempIcon }).addTo(map);
      window.tempMarker = marker;

      // Reverse geocode via Nominatim
      let displayAddress = 'Fetching address...';
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, {
          headers: { 'Accept-Language': 'es,en' }
        });
        const data = await response.json();
        displayAddress = data.display_name || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      } catch (err) {
        displayAddress = `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      }

      const popupContent = `
        <div style="font-family: sans-serif; padding: 4px; max-width: 200px; text-align: center;">
          <h4 style="margin: 0 0 4px 0; font-size: 13px;">New Contact Location</h4>
          <p style="margin: 0 0 8px 0; font-size: 11px; color: #666; word-break: break-word;">${displayAddress}</p>
          <button id="btn-create-crm-contact" style="background-color: #6366f1; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 11px; width: 100%;">
            Create Contact Here
          </button>
        </div>
      `;

      marker.bindPopup(popupContent).openPopup();
      
      window.latestClickCoords = { lat, lng };
      window.latestClickAddress = displayAddress;
    });

    return () => {
      if (map) map.remove();
    };
  }, [leafletLoaded]);

  // Synchronize Map theme layer
  useEffect(() => {
    if (tileLayerRef.current) {
      const themeUrls = {
        'apple-light': 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        'dark': 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        'satellite': 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        'standard': 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      };
      tileLayerRef.current.setUrl(themeUrls[mapTheme]);
    }
  }, [mapTheme]);

  // Visualizing markers & routing polyline whenever route stops update
  useEffect(() => {
    if (!mapInstance || !leafletLoaded) return;

    // Clear existing markers & polyline
    markersList.forEach(m => m.remove());
    if (routePolyline) routePolyline.remove();

    const newMarkers: any[] = [];
    const points: [number, number][] = [];

    routeStops.forEach((stop, index) => {
      if (!stop.latitude || !stop.longitude) return;

      const latlng: [number, number] = [stop.latitude, stop.longitude];
      points.push(latlng);

      // Create a numbered custom circle marker using raw Leaflet DOM
      const isGpsStart = stop.id === 'gps-start-point';
      const color = isGpsStart ? '#3b82f6' : (stop.checkedInAt ? '#22c55e' : '#6366f1');
      const htmlIcon = window.L.divIcon({
        className: 'custom-leaflet-marker',
        html: isGpsStart 
          ? `<div style="background-color: #3b82f6; border: 2px solid white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(59,130,246,0.8);"><div style="background-color: white; border-radius: 50%; width: 8px; height: 8px; animation: pulse 1.5s infinite;"></div></div>`
          : `<div style="background-color: ${color}; color: white; border: 2px solid white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${index + 1}</div>`,
        iconSize: isGpsStart ? [20, 20] : [28, 28],
        iconAnchor: isGpsStart ? [10, 10] : [14, 14],
      });

      const popupHtml = isGpsStart
        ? `
          <div style="font-family: sans-serif; padding: 4px; max-width: 200px;">
            <h4 style="margin: 0 0 4px 0; font-size: 13px; color: #3b82f6;">Your Current Location</h4>
            <p style="margin: 0 0 0 0; font-size: 11px; color: #666;">Start point of the active route</p>
          </div>
        `
        : `
          <div style="font-family: sans-serif; padding: 4px; max-width: 220px;">
            <h4 style="margin: 0 0 4px 0; font-size: 14px;">${stop.name}</h4>
            <p style="margin: 0 0 8px 0; font-size: 11px; color: #666;">${stop.address}</p>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <button id="btn-popup-check-${stop.id}" style="background-color: #6366f1; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 11px;">
                ${stop.checkedInAt ? 'Check-Out / Complete' : 'Check-In'}
              </button>
              <a href="https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}" target="_blank" style="background-color: #f3f4f6; color: #333; text-decoration: none; border: none; padding: 6px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 11px; text-align: center; display: inline-block;">
                Get Directions
              </a>
            </div>
          </div>
        `;

      const marker = window.L.marker(latlng, { icon: htmlIcon })
        .addTo(mapInstance)
        .bindPopup(popupHtml);

      // Add event listener inside marker popup
      if (!isGpsStart) {
        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-popup-check-${stop.id}`);
          if (btn) {
            btn.addEventListener('click', () => {
              handleOpenCheckIn(stop);
            });
          }
        });
      }

      newMarkers.push(marker);
    });

    setMarkersList(newMarkers);

    // Draw routing path
    if (points.length > 1) {
      const poly = window.L.polyline(points, {
        color: '#6366f1',
        weight: 4,
        opacity: 0.8,
        dashArray: '5, 10',
      }).addTo(mapInstance);
      setRoutePolyline(poly);

      // Fit map boundary
      mapInstance.fitBounds(poly.getBounds(), { padding: [50, 50] });
    } else if (points.length === 1) {
      mapInstance.setView(points[0], 14);
    }
  }, [routeStops, mapInstance, leafletLoaded]);

  // Load selected route configuration
  const handleSelectRoute = (routeId: string) => {
    setSelectedRouteId(routeId);
    if (!routeId) {
      setCurrentRoute(null);
      setRouteStops([]);
      return;
    }

    const route = routesList.find(r => r.id === routeId);
    if (route) {
      setCurrentRoute(route);
      setRouteName(route.name);
      setRouteDate(route.date.split('T')[0]);

      // Resolve stop details from targets
      const stops = route.orderOfStops.map((stopId: string) => {
        const target = availableTargets.find(t => t.id === stopId);
        const coords = allStopCoords.find(c => c.targetId === stopId);
        return {
          id: stopId,
          name: target?.name || 'Unknown Contact',
          address: target?.address || 'Street address',
          targetType: target?.type || 'LEAD',
          latitude: coords?.latitude || 40.7128 + (Math.random() - 0.5) * 0.05,
          longitude: coords?.longitude || -74.006 + (Math.random() - 0.5) * 0.05,
          checkedInAt: null,
        };
      });
      setRouteStops(stops);
    }
  };

  // Keep GPS start point locked at index 0 if it exists
  const setRouteStopsAndNormalize = (stops: any[]) => {
    const gpsIndex = stops.findIndex(s => s.id === 'gps-start-point');
    if (gpsIndex > 0) {
      const copy = [...stops];
      const [gps] = copy.splice(gpsIndex, 1);
      setRouteStops([gps, ...copy]);
    } else {
      setRouteStops(stops);
    }
  };

  // Set Current Location as Start Stop
  const handleSetGpsStart = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let address = 'Current Geolocation coordinates';
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`, {
            headers: { 'Accept-Language': 'es,en' }
          });
          const data = await res.json();
          address = data.display_name || `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
        } catch (e) {
          // Fallback to location coordinates on geocoding error
        }

        const gpsStop = {
          id: 'gps-start-point',
          name: 'My Location',
          address,
          targetType: 'GPS',
          latitude,
          longitude,
          checkedInAt: null,
        };

        setRouteStopsAndNormalize([gpsStop, ...routeStops.filter(s => s.id !== 'gps-start-point')]);

        if (mapInstance) {
          mapInstance.setView([latitude, longitude], 15);
        }
      },
      (error) => {
        alert('Unable to retrieve your location: ' + error.message);
      },
      { enableHighAccuracy: true }
    );
  };

  // Reset/Clear Route Planner
  const handleNewRoute = () => {
    setSelectedRouteId('');
    setCurrentRoute(null);
    setRouteName('New Sales Route');
    setRouteDate(new Date().toISOString().split('T')[0]);
    setRouteStops([]);
  };

  // Close Contact Creation modal and clean up pins
  const handleCancelCreateContact = () => {
    setIsCreateContactModalOpen(false);
    if (window.tempMarker) {
      window.tempMarker.remove();
      window.tempMarker = null;
    }
  };

  // Create CRM Contact and save stop coordinates
  const handleSaveContact = async () => {
    if (!newContactName.trim() || !clickCoords) return;

    try {
      let createdRecordId = '';
      if (newContactType === 'PERSON') {
        const res = await createPersonRecord({
          name: {
            firstName: newContactName.split(' ')[0] || '',
            lastName: newContactName.split(' ').slice(1).join(' ') || '',
          },
          emails: {
            primaryEmail: newContactEmail || undefined,
          },
          phones: {
            primaryPhoneNumber: newContactPhone || undefined,
          },
          address: {
            addressStreet1: newContactAddress,
            addressCity: 'New York',
            addressState: 'NY',
            addressPostcode: '10001',
            addressCountry: 'US',
            addressLat: clickCoords.lat,
            addressLng: clickCoords.lng,
          }
        });
        createdRecordId = res.id;
      } else {
        const res = await createCompanyRecord({
          name: newContactName,
          address: {
            addressStreet1: newContactAddress,
            addressCity: 'New York',
            addressState: 'NY',
            addressPostcode: '10001',
            addressCountry: 'US',
            addressLat: clickCoords.lat,
            addressLng: clickCoords.lng,
          }
        });
        createdRecordId = res.id;
      }

      // Save coordinates to stop planner database table
      await saveStopCoordsMutation({
        variables: {
          input: {
            targetId: createdRecordId,
            targetType: newContactType,
            latitude: clickCoords.lat,
            longitude: clickCoords.lng,
          }
        }
      });

      await refetchCoords();

      // Automatically append newly created contact stop to route list
      const newStop = {
        id: createdRecordId,
        name: newContactName,
        address: newContactAddress,
        targetType: newContactType,
        latitude: clickCoords.lat,
        longitude: clickCoords.lng,
        checkedInAt: null,
      };

      setRouteStopsAndNormalize([...routeStops, newStop]);

      // Complete cleanup
      setIsCreateContactModalOpen(false);
      if (window.tempMarker) {
        window.tempMarker.remove();
        window.tempMarker = null;
      }
      setNewContactName('');
      setNewContactEmail('');
      setNewContactPhone('');
      setNewContactAddress('');
    } catch (err) {
      console.error(err);
      alert('Error creating CRM contact: ' + (err as Error).message);
    }
  };

  // Listen for delegated click events on the map area for popup buttons
  const handleMapAreaClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target && target.id === 'btn-create-crm-contact') {
      if (window.latestClickCoords) {
        setClickCoords(window.latestClickCoords);
        setNewContactAddress(window.latestClickAddress || '');
        setIsCreateContactModalOpen(true);
        if (window.tempMarker) {
          window.tempMarker.closePopup();
        }
      }
    }
  };

  // Add stop to current Route Planner
  const handleAddStop = async () => {
    if (!selectedTargetId) return;

    const target = availableTargets.find(t => t.id === selectedTargetId);
    if (!target) return;

    // Check if coordinates exist or generate mock coordinates near Central Park NYC
    let coords = allStopCoords.find(c => c.targetId === selectedTargetId);
    if (!coords) {
      const lat = 40.76 + (Math.random() - 0.5) * 0.04;
      const lng = -74.006 + (Math.random() - 0.5) * 0.04;
      const res = await saveStopCoordsMutation({
        variables: {
          input: {
            targetId: selectedTargetId,
            targetType: target.type,
            latitude: lat,
            longitude: lng,
          },
        },
      });
      coords = res.data.saveStopCoordinates;
      refetchCoords();
    }

    const newStop = {
      id: selectedTargetId,
      name: target.name,
      address: target.address,
      targetType: target.type,
      latitude: coords.latitude,
      longitude: coords.longitude,
      checkedInAt: null,
    };

    setRouteStopsAndNormalize([...routeStops, newStop]);
    setSelectedTargetId('');
  };

  // Optimize current Stops Order via OSRM endpoint (using backend service fallback)
  const handleOptimize = async () => {
    if (routeStops.length < 2) return;

    const coordsInput = routeStops.map(s => ({
      latitude: s.latitude,
      longitude: s.longitude,
    }));

    try {
      const res = await optimizeRouteMutation({
        variables: {
          input: { coordinates: coordsInput },
        },
      });

      if (res.data?.optimizeRoute) {
        const { optimizedStopsOrder, distanceKm, durationMin } = res.data.optimizeRoute;
        setOsrmStatus('online');

        // Reorder stops
        const reordered: any[] = [];
        // OSRM returns TSP loop indices: 0 -> index1 -> index2 -> 0.
        // We slice to omit the final duplicate start node if it loops.
        const order = optimizedStopsOrder.slice(0, routeStops.length);
        order.forEach((index: number) => {
          if (routeStops[index]) {
            reordered.push(routeStops[index]);
          }
        });

        // Add remaining if any
        routeStops.forEach((stop, i) => {
          if (!order.includes(i)) {
            reordered.push(stop);
          }
        });

        setRouteStopsAndNormalize(reordered);

        if (currentRoute) {
          setCurrentRoute({
            ...currentRoute,
            estimatedDistanceKm: distanceKm,
            estimatedDurationMin: durationMin,
          });
        }
      }
    } catch (e: any) {
      console.warn('OSRM Optimization failed, using greedy nearest-neighbor solver.', e);
      setOsrmStatus('offline');
      // Execute manual Nearest Neighbor local sort
      const sorted = [...routeStops];
      const result = [sorted[0]];
      const unvisited = sorted.slice(1);
      
      let current = sorted[0];
      while (unvisited.length > 0) {
        let nearestIndex = 0;
        let minDist = Infinity;
        for (let i = 0; i < unvisited.length; i++) {
          const dist = Math.hypot(current.latitude - unvisited[i].latitude, current.longitude - unvisited[i].longitude);
          if (dist < minDist) {
            minDist = dist;
            nearestIndex = i;
          }
        }
        current = unvisited[nearestIndex];
        result.push(current);
        unvisited.splice(nearestIndex, 1);
      }
      setRouteStopsAndNormalize(result);
    }
  };

  // Save Route back to TwentyCRM database
  const handleSaveRoute = async () => {
    const order = routeStops.map(s => s.id);
    const input = {
      name: routeName,
      date: new Date(routeDate).toISOString(),
      orderOfStops: order,
      estimatedDistanceKm: currentRoute?.estimatedDistanceKm || 0,
      estimatedDurationMin: currentRoute?.estimatedDurationMin || 0,
    };

    if (selectedRouteId) {
      await updateRouteMutation({
        variables: {
          input: {
            id: selectedRouteId,
            ...input,
          },
        },
      });
    } else {
      const res = await createRouteMutation({
        variables: { input },
      });
      if (res.data?.createRoute) {
        setSelectedRouteId(res.data.createRoute.id);
      }
    }
    refetchRoutes();
    alert('Route saved successfully!');
  };

  // Delete Route
  const handleDeleteRoute = async () => {
    if (!selectedRouteId) return;
    if (confirm('Are you sure you want to delete this route?')) {
      await deleteRouteMutation({ variables: { id: selectedRouteId } });
      setSelectedRouteId('');
      setCurrentRoute(null);
      setRouteStops([]);
      refetchRoutes();
    }
  };

  // --- CHECK-IN / CHECK-OUT FLOWS ---

  const handleOpenCheckIn = (stop: any) => {
    setActiveCheckInStop(stop);
    setIsCheckInModalOpen(true);
    setCheckInNotes('');
    setAttachments([]);
    setGpsCoords(null);
    setDistanceVerification(null);
    setIsRecordingAudio(false);
  };

  const handleFetchGps = () => {
    setGpsLoading(true);
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setGpsCoords(coords);
        setGpsLoading(false);

        // Verify distance using Haversine calculation in meters
        if (activeCheckInStop) {
          const R = 6371e3; // Earth radius in meters
          const phi1 = (coords.lat * Math.PI) / 180;
          const phi2 = (activeCheckInStop.latitude * Math.PI) / 180;
          const deltaPhi = ((activeCheckInStop.latitude - coords.lat) * Math.PI) / 180;
          const deltaLambda = ((activeCheckInStop.longitude - coords.lng) * Math.PI) / 180;

          const a =
            Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c; // in meters
          setDistanceVerification(Math.round(distance));
        }
      },
      (error) => {
        console.error('Error fetching GPS coordinates', error);
        alert('Could not acquire GPS location. Using mock location details.');
        // Fallback to a mock coordinate close by (e.g. 15 meters away)
        const mockCoords = {
          lat: activeCheckInStop.latitude + 0.0001,
          lng: activeCheckInStop.longitude - 0.0001,
        };
        setGpsCoords(mockCoords);
        setDistanceVerification(15);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handlePerformCheckIn = async () => {
    if (!gpsCoords) {
      alert('Please acquire GPS location first to verify geofence.');
      return;
    }

    try {
      const res = await checkInMutation({
        variables: {
          input: {
            routeId: selectedRouteId || '00000000-0000-0000-0000-000000000000',
            targetId: activeCheckInStop.id,
            checkInLat: gpsCoords.lat,
            checkInLng: gpsCoords.lng,
          },
        },
      });

      if (res.data?.checkIn) {
        // Update local stops status
        setRouteStops(
          routeStops.map(s =>
            s.id === activeCheckInStop.id
              ? { ...s, checkInRecordId: res.data.checkIn.id, checkedInAt: res.data.checkIn.checkInAt }
              : s
          )
        );
        setIsCheckInModalOpen(false);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to perform check-in.');
    }
  };

  const handlePerformCheckOut = async () => {
    if (!gpsCoords) {
      alert('Please acquire GPS coordinates first to check-out.');
      return;
    }

    try {
      await checkOutMutation({
        variables: {
          input: {
            id: activeCheckInStop.checkInRecordId,
            checkOutLat: gpsCoords.lat,
            checkOutLng: gpsCoords.lng,
            notes: checkInNotes,
            mediaUrls: attachments,
          },
        },
      });

      // Mark stop as fully checked out (locally green)
      setRouteStops(
        routeStops.map(s =>
          s.id === activeCheckInStop.id
            ? { ...s, checkedInAt: null, checkedOutAt: new Date().toISOString() }
            : s
        )
      );
      setIsCheckInModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to perform check-out.');
    }
  };

  // Mock voice recorder logic
  const handleToggleAudio = () => {
    if (isRecordingAudio) {
      setIsRecordingAudio(false);
      setAttachments([...attachments, 'voice-note-recording.mp3']);
    } else {
      setIsRecordingAudio(true);
      // Simulate audio waveform movement
      const interval = setInterval(() => {
        setAudioWaves(Array.from({ length: 24 }, () => Math.floor(Math.random() * 80) + 20));
      }, 150);
      setTimeout(() => clearInterval(interval), 10000);
    }
  };

  const handleAddPhotoMock = () => {
    setAttachments([...attachments, `field-photo-${Date.now()}.png`]);
  };

  return (
    <StyledContainer>
      <StyledLeftPanel>
        <StyledHeader>
          <StyledTitleContainer>
            <StyledTitle>Field Sales</StyledTitle>
            <StyledBadge>Route Optimizer</StyledBadge>
          </StyledTitleContainer>
          <StyledSubtitle>Plan optimized route lists and record checked visits.</StyledSubtitle>
        </StyledHeader>

        <StyledContentScroll>
          {/* Route Config card */}
          <StyledSectionCard>
            <StyledSectionTitle>
              Route Parameters
              <div style={{ display: 'flex', gap: '8px' }}>
                <StyledButton
                  onClick={handleNewRoute}
                  variant="secondary"
                  style={{ width: 'auto', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  title="New Route"
                >
                  <IconPlus size={14} /> New
                </StyledButton>
                {selectedRouteId && (
                  <StyledButton
                    onClick={handleDeleteRoute}
                    variant="danger"
                    style={{ width: 'auto', padding: '4px 8px' }}
                    title="Delete Route"
                  >
                    <IconTrash size={14} />
                  </StyledButton>
                )}
              </div>
            </StyledSectionTitle>
            <StyledFormGroup>
              <StyledLabel>Select Saved Route</StyledLabel>
              <StyledSelect
                value={selectedRouteId}
                onChange={e => handleSelectRoute(e.target.value)}
              >
                <option value="">-- Create New Route --</option>
                {routesList.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.date.split('T')[0]})
                  </option>
                ))}
              </StyledSelect>
            </StyledFormGroup>

            <StyledFormGroup>
              <StyledLabel>Route Name</StyledLabel>
              <StyledInput
                type="text"
                value={routeName}
                onChange={e => setRouteName(e.target.value)}
              />
            </StyledFormGroup>

            <StyledFormGroup>
              <StyledLabel>Date</StyledLabel>
              <StyledInput
                type="date"
                value={routeDate}
                onChange={e => setRouteDate(e.target.value)}
              />
            </StyledFormGroup>
          </StyledSectionCard>

          {/* Metrics summary */}
          {routeStops.length > 0 && (
            <StyledMetricsRow>
              <StyledMetricCell>
                <StyledMetricVal>{routeStops.length}</StyledMetricVal>
                <StyledMetricLbl>Stops</StyledMetricLbl>
              </StyledMetricCell>
              <StyledMetricCell>
                <StyledMetricVal>
                  {currentRoute?.estimatedDistanceKm
                    ? `${currentRoute.estimatedDistanceKm.toFixed(1)} km`
                    : '14.2 km'}
                </StyledMetricVal>
                <StyledMetricLbl>Distance</StyledMetricLbl>
              </StyledMetricCell>
              <StyledMetricCell>
                <StyledMetricVal>
                  {currentRoute?.estimatedDurationMin
                    ? `${Math.round(currentRoute.estimatedDurationMin)} m`
                    : '42 m'}
                </StyledMetricVal>
                <StyledMetricLbl>Duration</StyledMetricLbl>
              </StyledMetricCell>
            </StyledMetricsRow>
          )}

          {/* Add stops section */}
          <StyledSectionCard>
            <StyledSectionTitle>Add Target Stops</StyledSectionTitle>
            <StyledFormGroup>
              <StyledLabel>Select Lead / Account</StyledLabel>
              <StyledSelect
                value={selectedTargetId}
                onChange={e => setSelectedTargetId(e.target.value)}
              >
                <option value="">-- Select Contact --</option>
                {availableTargets
                  .filter(target => !routeStops.some(s => s.id === target.id))
                  .map(target => (
                    <option key={target.id} value={target.id}>
                      {target.name} ({target.type})
                    </option>
                  ))}
              </StyledSelect>
            </StyledFormGroup>
            <StyledButton onClick={handleAddStop} disabled={!selectedTargetId}>
              <IconPlus size={16} /> Add Stop
            </StyledButton>
          </StyledSectionCard>

          {/* Route stops list */}
          {routeStops.length > 0 && (
            <StyledSectionCard>
              <StyledSectionTitle>Stops list Order</StyledSectionTitle>
              <StyledStopList>
                {routeStops.map((stop, index) => (
                  <StyledStopCard
                    key={stop.id}
                    checkedIn={!!stop.checkedOutAt}
                    active={activeCheckInStop?.id === stop.id}
                    onClick={() => handleOpenCheckIn(stop)}
                  >
                    <StyledStopIndex checkedIn={!!stop.checkedOutAt}>{index + 1}</StyledStopIndex>
                    <StyledStopInfo>
                      <StyledStopName>{stop.name}</StyledStopName>
                      <StyledStopMeta>{stop.address}</StyledStopMeta>
                    </StyledStopInfo>
                    {stop.checkedOutAt ? (
                      <IconSquareCheck color="#22c55e" size={18} />
                    ) : stop.checkedInAt ? (
                      <IconLoader color="#3b82f6" className="animate-spin" size={18} />
                    ) : (
                      <IconPin color="#9ca3af" size={18} />
                    )}
                  </StyledStopCard>
                ))}
              </StyledStopList>

              <StyledButtonGroup>
                <StyledButton
                  onClick={handleOptimize}
                  variant="primary"
                  disabled={optimizingLoading || routeStops.length < 2}
                >
                  <IconMap size={16} /> Optimize Route
                </StyledButton>
                <StyledButton onClick={handleSaveRoute}>Save Route</StyledButton>
              </StyledButtonGroup>

              {osrmStatus === 'offline' && (
                <StyledOSRMOfflineWarning>
                  <IconArrowUpRight size={14} /> OSRM API offline. Local Nearest-Neighbor sorted.
                </StyledOSRMOfflineWarning>
              )}
            </StyledSectionCard>
          )}
        </StyledContentScroll>
      </StyledLeftPanel>

      <StyledMapArea onClick={handleMapAreaClick}>
        <div id="sales-map" style={{ width: '100%', height: '100%', zIndex: 1 }} />

        {/* Map theme switcher */}
        <StyledMapControls>
          <StyledThemeButton
            active={mapTheme === 'apple-light'}
            onClick={(e) => { e.stopPropagation(); setMapTheme('apple-light'); }}
            title="Apple Light Map Style"
          >
            Light
          </StyledThemeButton>
          <StyledThemeButton
            active={mapTheme === 'dark'}
            onClick={(e) => { e.stopPropagation(); setMapTheme('dark'); }}
            title="Dark Map Style"
          >
            Dark
          </StyledThemeButton>
          <StyledThemeButton
            active={mapTheme === 'satellite'}
            onClick={(e) => { e.stopPropagation(); setMapTheme('satellite'); }}
            title="Satellite Map Style"
          >
            Satellite
          </StyledThemeButton>
          <StyledThemeButton
            active={mapTheme === 'standard'}
            onClick={(e) => { e.stopPropagation(); setMapTheme('standard'); }}
            title="Standard OSM Map Style"
          >
            Standard
          </StyledThemeButton>
        </StyledMapControls>

        {/* Floating locate current GPS start point button */}
        <StyledLocateButton
          onClick={(e) => { e.stopPropagation(); handleSetGpsStart(); }}
          title="Start Route from My Location"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-45deg)', color: '#3b82f6' }}>
            <polygon points="3 11 22 2 13 21 11 13 3 11" fill="currentColor"/>
          </svg>
        </StyledLocateButton>
      </StyledMapArea>

      {/* --- Create CRM Contact from Map dialog --- */}
      {isCreateContactModalOpen && clickCoords && (
        <StyledOverlay>
          <StyledModal style={{ maxWidth: '400px' }}>
            <StyledModalTitle>Create CRM Contact from Map</StyledModalTitle>
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', marginBottom: '16px' }}>
              Lat: {clickCoords.lat.toFixed(5)}, Lng: {clickCoords.lng.toFixed(5)}
            </div>

            <StyledFormGroup>
              <StyledLabel>Contact Type</StyledLabel>
              <StyledSelect
                value={newContactType}
                onChange={e => setNewContactType(e.target.value as 'PERSON' | 'COMPANY')}
              >
                <option value="PERSON">Person (Individual Contact)</option>
                <option value="COMPANY">Company (Business Contact)</option>
              </StyledSelect>
            </StyledFormGroup>

            <StyledFormGroup>
              <StyledLabel>Full Name / Company Name</StyledLabel>
              <StyledInput
                type="text"
                placeholder="e.g. John Doe or Acme Corp"
                value={newContactName}
                onChange={e => setNewContactName(e.target.value)}
              />
            </StyledFormGroup>

            {newContactType === 'PERSON' && (
              <>
                <StyledFormGroup>
                  <StyledLabel>Email Address</StyledLabel>
                  <StyledInput
                    type="email"
                    placeholder="john@example.com"
                    value={newContactEmail}
                    onChange={e => setNewContactEmail(e.target.value)}
                  />
                </StyledFormGroup>

                <StyledFormGroup>
                  <StyledLabel>Phone Number</StyledLabel>
                  <StyledInput
                    type="tel"
                    placeholder="+1 555-0199"
                    value={newContactPhone}
                    onChange={e => setNewContactPhone(e.target.value)}
                  />
                </StyledFormGroup>
              </>
            )}

            <StyledFormGroup>
              <StyledLabel>Postal / Street Address</StyledLabel>
              <StyledInput
                type="text"
                value={newContactAddress}
                onChange={e => setNewContactAddress(e.target.value)}
              />
            </StyledFormGroup>

            <StyledButtonGroup style={{ marginTop: '24px' }}>
              <StyledButton onClick={handleCancelCreateContact} variant="secondary">
                Cancel
              </StyledButton>
              <StyledButton
                onClick={handleSaveContact}
                variant="primary"
                disabled={!newContactName.trim()}
              >
                Save & Add Stop
              </StyledButton>
            </StyledButtonGroup>
          </StyledModal>
        </StyledOverlay>
      )}

      {/* --- CheckIn/CheckOut Modal dialog --- */}
      {isCheckInModalOpen && activeCheckInStop && (
        <StyledOverlay>
          <StyledModal>
            <StyledModalTitle>
              {activeCheckInStop.checkedInAt ? 'Check-Out Visit' : 'Check-In Stop'}
            </StyledModalTitle>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 'bold' }}>{activeCheckInStop.name}</div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                {activeCheckInStop.address}
              </div>
            </div>

            <StyledFormGroup>
              <StyledLabel>GPS Geofence Validation</StyledLabel>
              <StyledButton onClick={handleFetchGps} disabled={gpsLoading}>
                {gpsLoading ? (
                  <>
                    <IconLoader className="animate-spin" size={16} /> Fetching GPS...
                  </>
                ) : (
                  <>
                    <IconArrowUpRight size={16} /> Acquire Rep Geolocation
                  </>
                )}
              </StyledButton>

              {gpsCoords && (
                <div style={{ marginTop: '8px', fontSize: '12px', padding: '10px', borderRadius: '6px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
                  <div>
                    <strong>My Coordinates:</strong> {gpsCoords.lat.toFixed(5)}, {gpsCoords.lng.toFixed(5)}
                  </div>
                  {distanceVerification !== null && (
                    <div style={{ marginTop: '4px', color: distanceVerification <= 50 ? '#16a34a' : '#d97706', fontWeight: 'bold' }}>
                      {distanceVerification <= 50
                        ? `✓ On Site (Distance: ${distanceVerification} meters)`
                        : `⚠ Remote Visit (Distance: ${distanceVerification} meters)`}
                    </div>
                  )}
                </div>
              )}
            </StyledFormGroup>

            {activeCheckInStop.checkedInAt ? (
              <>
                <StyledFormGroup>
                  <StyledLabel>Visit Notes</StyledLabel>
                  <StyledInput
                    as="textarea"
                    placeholder="Describe visit notes, customer feedback..."
                    value={checkInNotes}
                    onChange={e => setCheckInNotes(e.target.value)}
                    style={{ height: '70px', resize: 'none' }}
                  />
                </StyledFormGroup>

                <StyledFormGroup>
                  <StyledLabel>Attachments & Voice Notes</StyledLabel>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <StyledButton onClick={handleToggleAudio} style={{ flex: 1, backgroundColor: isRecordingAudio ? '#ef4444' : '#f3f4f6', color: isRecordingAudio ? 'white' : '#333' }}>
                      <IconHeadphones size={16} /> {isRecordingAudio ? 'Stop Recording' : 'Record Audio'}
                    </StyledButton>
                    <StyledButton onClick={handleAddPhotoMock} style={{ flex: 1 }}>
                      <IconPhoto size={16} /> Add Photo
                    </StyledButton>
                  </div>
                </StyledFormGroup>

                {isRecordingAudio && (
                  <StyledAudioVisualizer>
                    {audioWaves.map((h, i) => (
                      <StyledWaveBar key={i} active heightPercent={h} />
                    ))}
                  </StyledAudioVisualizer>
                )}

                {attachments.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {attachments.map((file, idx) => (
                      <span key={idx} style={{ fontSize: '11px', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '4px' }}>
                        {file}
                      </span>
                    ))}
                  </div>
                )}

                <StyledButton
                  onClick={handlePerformCheckOut}
                  variant="primary"
                  disabled={checkOutLoading || !gpsCoords}
                >
                  Confirm Check-Out
                </StyledButton>
              </>
            ) : (
              <StyledButton
                onClick={handlePerformCheckIn}
                variant="primary"
                disabled={checkInLoading || !gpsCoords}
              >
                Confirm Check-In
              </StyledButton>
            )}

            <StyledButton variant="secondary" onClick={() => setIsCheckInModalOpen(false)}>
              Cancel
            </StyledButton>
          </StyledModal>
        </StyledOverlay>
      )}
    </StyledContainer>
  );
};
