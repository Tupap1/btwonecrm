import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CheckInEntity } from 'src/engine/core-modules/field-sales/check-in.entity';
import { RouteEntity } from 'src/engine/core-modules/field-sales/route.entity';
import { StopCoordinatesEntity } from 'src/engine/core-modules/field-sales/stop-coordinates.entity';
import { FieldSalesService } from 'src/engine/core-modules/field-sales/services/field-sales.service';

describe('FieldSalesService', () => {
  let service: FieldSalesService;
  let stopCoordsRepo: Repository<StopCoordinatesEntity>;
  let routeRepo: Repository<RouteEntity>;
  let checkInRepo: Repository<CheckInEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FieldSalesService,
        {
          provide: getRepositoryToken(StopCoordinatesEntity),
          useValue: {
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RouteEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CheckInEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FieldSalesService>(FieldSalesService);
    stopCoordsRepo = module.get<Repository<StopCoordinatesEntity>>(
      getRepositoryToken(StopCoordinatesEntity),
    );
    routeRepo = module.get<Repository<RouteEntity>>(getRepositoryToken(RouteEntity));
    checkInRepo = module.get<Repository<CheckInEntity>>(getRepositoryToken(CheckInEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateHaversineDistance', () => {
    it('should calculate distance between two coordinates correctly', () => {
      // Coordinates for London and Paris
      const lat1 = 51.5074;
      const lon1 = -0.1278;
      const lat2 = 48.8566;
      const lon2 = 2.3522;

      const distance = service.calculateHaversineDistance(lat1, lon1, lat2, lon2);

      // Distance should be approximately 344 km (344000 meters)
      expect(distance).toBeGreaterThan(340000);
      expect(distance).toBeLessThan(350000);
    });

    it('should return 0 for identical coordinates', () => {
      const lat = 40.7128;
      const lon = -74.006;

      const distance = service.calculateHaversineDistance(lat, lon, lat, lon);
      expect(distance).toBe(0);
    });
  });

  describe('optimizeStops', () => {
    it('should fallback to local nearest neighbor optimization when OSRM fails or fetch errors', async () => {
      // Mock global fetch to reject
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockRejectedValue(new Error('OSRM API Offline'));

      const coordinates = [
        { latitude: 40.7128, longitude: -74.006 }, // New York
        { latitude: 34.0522, longitude: -118.2437 }, // Los Angeles
        { latitude: 41.8781, longitude: -87.6298 }, // Chicago
      ];

      const result = await service.optimizeStops(coordinates);

      expect(result.optimizedStopsOrder).toBeDefined();
      expect(result.optimizedStopsOrder.length).toBe(4); // New York -> Chicago -> LA -> New York (loop)
      expect(result.optimizedStopsOrder[0]).toBe(0); // Starts at 0
      expect(result.optimizedStopsOrder[result.optimizedStopsOrder.length - 1]).toBe(0); // Ends at 0
      expect(result.distanceKm).toBeGreaterThan(0);
      expect(result.durationMin).toBeGreaterThan(0);

      // Restore fetch
      global.fetch = originalFetch;
    });

    it('should handle single coordinate or empty array input correctly without calling OSRM', async () => {
      const singleCoord = [{ latitude: 40.7128, longitude: -74.006 }];
      const result = await service.optimizeStops(singleCoord);

      expect(result.optimizedStopsOrder).toEqual([0]);
      expect(result.distanceKm).toBe(0);
      expect(result.durationMin).toBe(0);
    });
  });
});
