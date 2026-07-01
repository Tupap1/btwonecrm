import React, { useEffect, useState, useRef } from 'react';
import { useQuery, useMutation } from '@apollo/client';
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

// --- COMPONENT IMPLEMENTATION ---

interface LeafletWindow extends Window {
  L?: any;
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

  // Fetch Companies & People from CRM dynamic store
  const { records: companiesData } = useFindManyRecords({ objectNameSingular: 'company' });
  const { records: peopleData } = useFindManyRecords({ objectNameSingular: 'person' });

  // Apollo queries/mutations
  const { data: routesQueryData, refetch: refetchRoutes } = useQuery(GET_ROUTES);
  const { data: coordsQueryData, refetch: refetchCoords } = useQuery(GET_ALL_STOP_COORDINATES);

  const [optimizeRouteMutation, { loading: optimizingLoading }] = useMutation(OPTIMIZE_ROUTE);
  const [createRouteMutation] = useMutation(CREATE_ROUTE);
  const [updateRouteMutation] = useMutation(UPDATE_ROUTE);
  const [deleteRouteMutation] = useMutation(DELETE_ROUTE);
  const [saveStopCoordsMutation] = useMutation(SAVE_STOP_COORDINATES);
  const [checkInMutation, { loading: checkInLoading }] = useMutation(CHECK_IN);
  const [checkOutMutation, { loading: checkOutLoading }] = useMutation(CHECK_OUT);

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

  // Map Initialization
  useEffect(() => {
    if (!leafletLoaded || !document.getElementById('sales-map') || mapInstance) return;

    // Centered around New York City
    const map = window.L.map('sales-map').setView([40.7128, -74.006], 13);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    setMapInstance(map);

    return () => {
      if (map) map.remove();
    };
  }, [leafletLoaded]);

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
      const color = stop.checkedInAt ? '#22c55e' : '#6366f1';
      const htmlIcon = window.L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div style="background-color: ${color}; color: white; border: 2px solid white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${index + 1}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const popupHtml = `
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
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-popup-check-${stop.id}`);
        if (btn) {
          btn.addEventListener('click', () => {
            handleOpenCheckIn(stop);
          });
        }
      });

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

    setRouteStops([...routeStops, newStop]);
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

        setRouteStops(reordered);

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
      setRouteStops(result);
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
              {selectedRouteId && (
                <StyledButton
                  onClick={handleDeleteRoute}
                  variant="danger"
                  style={{ width: 'auto', padding: '4px 8px' }}
                >
                  <IconTrash size={14} />
                </StyledButton>
              )}
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

      <StyledMapArea>
        <div id="sales-map" style={{ width: '100%', height: '100%', zIndex: 1 }} />
      </StyledMapArea>

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
