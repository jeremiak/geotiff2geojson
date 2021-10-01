#!/usr/bin/env node

import vm from 'vm'
import { promises as fs } from 'fs'

import { Command } from 'commander/esm.mjs';
import { fromFile } from 'geotiff'
import geokeysToProj4 from 'geotiff-geokeys-to-proj4'
import proj4 from 'proj4'

const program = new Command()

program
    .option('-i, --input <file>', 'GeoTIFF file ')
    .option('-f, --filter <expression>', 'Filter out features, value is assigned to "d"')
    .option('-o, --output <file>', 'GeoJSON file to write, standard out used if missing')
    .option('-p, --proj <projection>', 'Projection to use', 'WGS84')
    .option('--pretty-print', 'Pretty-print GeoJSON')

program.parse(process.argv)

const options = program.opts()

if (!options.input) {
    throw new Error('Input file required, use -i flag or --help for more information')
}

const tiff = await fromFile(options.input)
const image = await tiff.getImage()
const geoKeys = image.getGeoKeys()
const projObj = geokeysToProj4.toProj4(geoKeys)
const projection = proj4(projObj.proj4, options.proj)

const maxX = image.getWidth()
const maxY = image.getHeight()
const origin = image.getOrigin()
const resolution = image.getResolution()
const xSize = resolution[0]
const ySize = resolution[1]

const features = []

let raster = await image.readRasters({ window: [0, 0, maxX, maxY] });
let color0 = raster[0]; // Raster is a TypedArray where elements are colors and their elements are pixel values of that color

color0.forEach((d, i) => {
    const context = { d }
    vm.createContext(context)
    if (options.filter && !vm.runInContext(options.filter, context)) return

    const y = Math.floor(i / maxX)
    const x = i % maxX
        // Convert current pixel's coordinates to CRS by:
        // 1. Multiplying current coordinates by pixel size which will result in distance from top-left corner in CRS units.
        // 2. Adding this value to top-left corner coordinates which will result in "global" coordinates in CRS units.
    let crsX = origin[0] + x * xSize
    let crsY = origin[1] + y * ySize

    // Check if coordinates are already in meters (or other "standard" units). If not, convert them.
    let point;
    if (projObj.shouldConvertCoordinates)
        point = geokeysToProj4.convertCoordinates(crsX, crsY, projObj.coordinatesConversionParameters);
    else
        point = { x: crsX, y: crsY };
    // Or just multiply manually to speed up execution by removing function calls:
    point = {
        x: crsX * projObj.coordinatesConversionParameters.x,
        y: crsY * projObj.coordinatesConversionParameters.y,
    }

    let projectedPoint = projection.forward(point); // Project these coordinates

    // Work with projected coordinates
    features.push({
        "type": "Feature",
        "properties": {
            value: d,
        },
        "geometry": {
            "type": "Point",
            "coordinates": [projectedPoint.x, projectedPoint.y]
        }
    })
})

const geojson = options.prettyPrint ? JSON.stringify({ type: 'FeatureCollection', features }, null, 2) : JSON.stringify({ type: 'FeatureCollection', features })

if (options.output) {
    await fs.writeFile(options.output, geojson)
} else {
    process.stdout.write(geojson)
}