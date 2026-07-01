import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CheckInEntity } from 'src/engine/core-modules/field-sales/check-in.entity';
import { RouteEntity } from 'src/engine/core-modules/field-sales/route.entity';
import { StopCoordinatesEntity } from 'src/engine/core-modules/field-sales/stop-coordinates.entity';

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface OptimizationResult {
  optimizedStopsOrder: number[]; // Array of indices mapping to the input coordinates
  distanceKm: number;
  durationMin: number;
  polyline: string;
}

@Injectable()
export class FieldSalesService {
  private readonly logger = new Logger(FieldSalesService.name);

  constructor(
    @InjectRepository(StopCoordinatesEntity)
    private readonly stopCoordinatesRepository: Repository<StopCoordinatesEntity>,
    @InjectRepository(RouteEntity)
    private readonly routeRepository: Repository<RouteEntity>,
    @InjectRepository(CheckInEntity)
    private readonly checkInRepository: Repository<CheckInEntity>,
  ) {}

  /**
   * Calculates the Haversine distance in meters between two points
   */
  public calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) *
        Math.cos(phi2) *
        Math.sin(deltaLambda / 2) *
        Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Nearest neighbor fallback route optimizer (local computation)
   */
  private optimizeNearestNeighbor(coordinates: Coordinate[]): OptimizationResult {
    const n = coordinates.length;
    if (n === 0) {
      return { optimizedStopsOrder: [], distanceKm: 0, durationMin: 0, polyline: '' };
    }

    const visited = new Array(n).fill(false);
    const order: number[] = [0];
    visited[0] = true;

    let totalDistanceMeters = 0;
    let currentIdx = 0;

    for (let step = 1; step < n; step++) {
      let nearestIdx = -1;
      let minDistance = Infinity;

      for (let i = 0; i < n; i++) {
        if (!visited[i]) {
          const dist = this.calculateHaversineDistance(
            coordinates[currentIdx].latitude,
            coordinates[currentIdx].longitude,
            coordinates[i].latitude,
            coordinates[i].longitude,
          );
          if (dist < minDistance) {
            minDistance = dist;
            nearestIdx = i;
          }
        }
      }

      if (nearestIdx !== -1) {
        visited[nearestIdx] = true;
        order.push(nearestIdx);
        totalDistanceMeters += minDistance;
        currentIdx = nearestIdx;
      }
    }

    // Add distance back to start to close the loop
    const returnDistance = this.calculateHaversineDistance(
      coordinates[currentIdx].latitude,
      coordinates[currentIdx].longitude,
      coordinates[0].latitude,
      coordinates[0].longitude,
    );
    totalDistanceMeters += returnDistance;
    order.push(0);

    // Approximate metrics (assumes average driving speed of 40 km/h)
    const distanceKm = totalDistanceMeters / 1000;
    const durationMin = (distanceKm / 40) * 60;

    return {
      optimizedStopsOrder: order,
      distanceKm: parseFloat(distanceKm.toFixed(2)),
      durationMin: Math.round(durationMin),
      polyline: '', // Polyline cannot be generated locally without map data
    };
  }

  /**
   * Calls public OSRM (Open Source Routing Machine) API to optimize stops order (TSP)
   */
  public async optimizeStops(coordinates: Coordinate[]): Promise<OptimizationResult> {
    if (coordinates.length <= 1) {
      return {
        optimizedStopsOrder: coordinates.map((_, i) => i),
        distanceKm: 0,
        durationMin: 0,
        polyline: '',
      };
    }

    // Form OSRM trip URL
    const coordsString = coordinates
      .map((c) => `${c.longitude},${c.latitude}`)
      .join(';');

    // source=first means start at the first coordinates point (index 0)
    const url = `http://router.project-osrm.org/trip/v1/driving/${coordsString}?source=first&destination=any&roundtrip=true&overview=full`;

    try {
      this.logger.log(`Requesting route optimization from OSRM: ${url}`);
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'TwentyCRM-FieldSalesModule/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`OSRM responded with status: ${response.status}`);
      }

      const data = await response.json();

      if (data.code !== 'Ok' || !data.trips || data.trips.length === 0) {
        throw new Error(`OSRM trip calculation failed: ${data.message || data.code}`);
      }

      const trip = data.trips[0];
      const distanceKm = trip.distance / 1000;
      const durationMin = trip.duration / 60;
      const polyline = trip.geometry;

      // Extract optimized stop order from waypoints
      // OSRM waypoints contain the mapping to our input coordinates:
      // waypoint_index is the index of the coordinate in the query
      // trips_index is the index of the coordinate in the optimized trip
      const waypoints = data.waypoints as Array<{
        waypoint_index: number;
        trips_index: number;
      }>;

      // Sort waypoints by trips_index to get the order they are visited
      const sortedWaypoints = [...waypoints].sort(
        (a, b) => a.trips_index - b.trips_index,
      );

      const optimizedStopsOrder = sortedWaypoints.map((w) => w.waypoint_index);

      // Check if we need to complete the loop (roundtrip=true returns to start, so add start at the end)
      if (optimizedStopsOrder[optimizedStopsOrder.length - 1] !== optimizedStopsOrder[0]) {
        optimizedStopsOrder.push(optimizedStopsOrder[0]);
      }

      return {
        optimizedStopsOrder,
        distanceKm: parseFloat(distanceKm.toFixed(2)),
        durationMin: Math.round(durationMin),
        polyline,
      };
    } catch (error) {
      this.logger.error(
        `OSRM Optimization failed. Falling back to local greedy solver. Error: ${error.message}`,
      );
      return this.optimizeNearestNeighbor(coordinates);
    }
  }

  // Repository Methods
  public async getStopCoordinates(
    workspaceId: string,
    targetId: string,
  ): Promise<StopCoordinatesEntity | null> {
    return this.stopCoordinatesRepository.findOne({
      where: { workspaceId, targetId },
    });
  }

  public async getStopCoordinatesList(
    workspaceId: string,
    targetIds: string[],
  ): Promise<StopCoordinatesEntity[]> {
    if (targetIds.length === 0) return [];
    return this.stopCoordinatesRepository.createQueryBuilder('stop')
      .where('stop.workspaceId = :workspaceId', { workspaceId })
      .andWhere('stop.targetId IN (:...targetIds)', { targetIds })
      .getMany();
  }

  public async saveStopCoordinates(
    workspaceId: string,
    targetId: string,
    targetType: 'LEAD' | 'ACCOUNT',
    latitude: number,
    longitude: number,
  ): Promise<StopCoordinatesEntity> {
    let entity = await this.getStopCoordinates(workspaceId, targetId);
    if (!entity) {
      entity = this.stopCoordinatesRepository.create({
        workspaceId,
        targetId,
        targetType,
        latitude,
        longitude,
      });
    } else {
      entity.latitude = latitude;
      entity.longitude = longitude;
    }
    return this.stopCoordinatesRepository.save(entity);
  }

  public async createRoute(
    workspaceId: string,
    data: Partial<RouteEntity>,
  ): Promise<RouteEntity> {
    const route = this.routeRepository.create({
      ...data,
      workspaceId,
    });
    return this.routeRepository.save(route);
  }

  public async getRoute(workspaceId: string, id: string): Promise<RouteEntity | null> {
    return this.routeRepository.findOne({
      where: { workspaceId, id },
    });
  }

  public async getRoutes(workspaceId: string): Promise<RouteEntity[]> {
    return this.routeRepository.find({
      where: { workspaceId },
      order: { date: 'DESC' },
    });
  }

  public async updateRoute(
    workspaceId: string,
    id: string,
    data: Partial<RouteEntity>,
  ): Promise<RouteEntity | null> {
    await this.routeRepository.update({ workspaceId, id }, data);
    return this.getRoute(workspaceId, id);
  }

  public async deleteRoute(workspaceId: string, id: string): Promise<boolean> {
    const result = await this.routeRepository.delete({ workspaceId, id });
    return (result.affected ?? 0) > 0;
  }

  public async createCheckIn(
    workspaceId: string,
    data: Partial<CheckInEntity>,
  ): Promise<CheckInEntity> {
    // If target coordinates are available, validate geofencing
    const coordinates = await this.getStopCoordinates(workspaceId, data.targetId || '');
    let isRemote = false;
    let distanceFromTargetMeters = null;

    if (coordinates && data.checkInLat && data.checkInLng) {
      distanceFromTargetMeters = this.calculateHaversineDistance(
        data.checkInLat,
        data.checkInLng,
        coordinates.latitude,
        coordinates.longitude,
      );
      // Remote check-in threshold of 50 meters
      isRemote = distanceFromTargetMeters > 50;
    }

    const checkIn = this.checkInRepository.create({
      ...data,
      workspaceId,
      isRemote,
      distanceFromTargetMeters: distanceFromTargetMeters
        ? parseFloat(distanceFromTargetMeters.toFixed(2))
        : null,
    });
    return this.checkInRepository.save(checkIn);
  }

  public async getCheckIn(workspaceId: string, id: string): Promise<CheckInEntity | null> {
    return this.checkInRepository.findOne({
      where: { workspaceId, id },
    });
  }

  public async getCheckInsForRoute(
    workspaceId: string,
    routeId: string,
  ): Promise<CheckInEntity[]> {
    return this.checkInRepository.find({
      where: { workspaceId, routeId },
      order: { checkInAt: 'ASC' },
    });
  }

  public async checkOut(
    workspaceId: string,
    id: string,
    checkOutLat: number,
    checkOutLng: number,
    notes?: string | null,
    mediaUrls?: string[] | null,
  ): Promise<CheckInEntity | null> {
    const checkIn = await this.getCheckIn(workspaceId, id);
    if (!checkIn) {
      return null;
    }

    const checkOutAt = new Date();
    const durationMs = checkOutAt.getTime() - checkIn.checkInAt.getTime();
    const durationMinutes = Math.round(durationMs / 60000);

    checkIn.checkOutAt = checkOutAt;
    checkIn.checkOutLat = checkOutLat;
    checkIn.checkOutLng = checkOutLng;
    checkIn.durationMinutes = durationMinutes;
    if (notes !== undefined) checkIn.notes = notes;
    if (mediaUrls !== undefined) checkIn.mediaUrls = mediaUrls;

    return this.checkInRepository.save(checkIn);
  }
}
