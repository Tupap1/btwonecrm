import { gql } from '@apollo/client';

export const OPTIMIZE_ROUTE = gql`
  mutation OptimizeRoute($input: OptimizeRouteInput!) {
    optimizeRoute(input: $input) {
      optimizedStopsOrder
      distanceKm
      durationMin
      polyline
    }
  }
`;

export const GET_ROUTES = gql`
  query GetRoutes($assigneeId: String) {
    getRoutes(assigneeId: $assigneeId) {
      id
      name
      date
      status
      orderOfStops
      estimatedDistanceKm
      estimatedDurationMin
      assigneeId
      createdAt
      updatedAt
    }
  }
`;

export const GET_ROUTE = gql`
  query GetRoute($id: String!) {
    getRoute(id: $id) {
      id
      name
      date
      status
      orderOfStops
      estimatedDistanceKm
      estimatedDurationMin
      assigneeId
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_ROUTE = gql`
  mutation CreateRoute($input: CreateRouteInput!) {
    createRoute(input: $input) {
      id
      name
      date
      status
      orderOfStops
      estimatedDistanceKm
      estimatedDurationMin
      assigneeId
    }
  }
`;

export const UPDATE_ROUTE = gql`
  mutation UpdateRoute($input: UpdateRouteInput!) {
    updateRoute(input: $input) {
      id
      name
      date
      status
      orderOfStops
      estimatedDistanceKm
      estimatedDurationMin
      assigneeId
    }
  }
`;

export const DELETE_ROUTE = gql`
  mutation DeleteRoute($id: String!) {
    deleteRoute(id: $id)
  }
`;

export const GET_ALL_STOP_COORDINATES = gql`
  query GetAllStopCoordinates {
    getAllStopCoordinates {
      id
      targetId
      targetType
      latitude
      longitude
    }
  }
`;

export const SAVE_STOP_COORDINATES = gql`
  mutation SaveStopCoordinates($input: SaveStopCoordinatesInput!) {
    saveStopCoordinates(input: $input) {
      id
      targetId
      targetType
      latitude
      longitude
    }
  }
`;

export const CHECK_IN = gql`
  mutation CheckIn($input: CreateCheckInInput!) {
    checkIn(input: $input) {
      id
      routeId
      targetId
      checkInAt
      checkInLat
      checkInLng
      isRemote
    }
  }
`;

export const CHECK_OUT = gql`
  mutation CheckOut($input: CheckOutInput!) {
    checkOut(input: $input) {
      id
      routeId
      targetId
      checkInAt
      checkOutAt
      checkInLat
      checkInLng
      checkOutLat
      checkOutLng
      isRemote
      distanceFromTargetMeters
      durationMinutes
      notes
      mediaUrls
    }
  }
`;
