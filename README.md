# geotiff2geojson

[![geotiff2geojson on NPM](https://nodei.co/npm/geotiff2geojson.png?compact=true)](https://npmjs.org/package/geotiff2geojson)


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

`npm install -g geotiff2geojson`

If you want to do development or install from `main`, you can run the following steps:

1. `git clone git@github.com:jeremiak/geotiff2geojson.git`
2. `cd geotiff2geojson`
3. `npm install`
4. `npm link`

You should now be able to use `geotiff2geojson` as a CLI tool anywhere. Let me know how it goes!
