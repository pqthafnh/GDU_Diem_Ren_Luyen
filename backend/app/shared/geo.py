"""Geospatial validation helpers."""

from math import asin, cos, radians, sin, sqrt


def haversine_meters(
    latitude_a: float, longitude_a: float, latitude_b: float, longitude_b: float
) -> float:
    """Calculate great-circle distance between two coordinates in meters."""
    earth_radius = 6_371_000.0
    lat_delta = radians(latitude_b - latitude_a)
    lon_delta = radians(longitude_b - longitude_a)
    value = (
        sin(lat_delta / 2) ** 2
        + cos(radians(latitude_a)) * cos(radians(latitude_b)) * sin(lon_delta / 2) ** 2
    )
    return 2 * earth_radius * asin(sqrt(value))
