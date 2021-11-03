# geotiff2geojson

[![geotiff2geojson on NPM](https://nodei.co/npm/geotiff2geojson.png?compact=true)](https://npmjs.org/package/geotiff2geojson)


Convert a GeoTIFF image into a GeoJSON `FeatureCollection` of `Point` features.

```
Usage: geotiff2geojson [options]

Options:
  -b, --band <index>         The band that contains the data (default: 0)
  -f, --filter <expression>  Filter out features, value is assigned to "d"
  -i, --input <file>         GeoTIFF file
  -o, --output <file>        GeoJSON file to write, standard out used if missing
  -p, --proj <projection>    Projection to use (default: "WGS84")
  -v, --verbose              Provide more detailed output, use with -o only
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
