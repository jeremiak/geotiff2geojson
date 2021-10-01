# geotiff2geojson

Convert a GeoTIFF image into a GeoJSON `FeatureCollection` of `Point` features.

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

## Installation

This tool is not yet published to NPM, though I plan to set that up at some point. In the meantime, here's how to install.

1. `git clone git@github.com:jeremiak/geotiff2geojson.git`
2. `cd geotiff2geojson`
3. `npm install`
4. `npm link`

You should now be able to use `geotiff2geojson` as a CLI tool anywhere. Let me know how it goes!