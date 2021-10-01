# geotiff2geojson

Convert a GeoTIFF image into a GeoJSON FeatureCollection of Points.

```
Usage: geotiff2geojson [options]

Options:
  -i, --input <file>         GeoTIFF file
  -f, --filter <expression>  Filter out features, value is assigned to "d"
                             (default: "d !== -999000000")
  -o, --output <file>        GeoJSON file to write, standard out used if
                             missing
  -p, --proj <projection>    Projection to use (default: "WGS84")
  --pretty-print             Pretty-print GeoJSON
  -h, --help                 display help for command
```