#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

import { Command } from 'commander/esm.mjs';
import { fromFile } from 'geotiff'
import geokeysToProj4 from 'geotiff-geokeys-to-proj4'
import proj4 from 'proj4'
import Progress from 'progress'
import transform from 'stream-transform'

const cwd = process.cwd()
const program = new Command()

program
    .option('-b, --band <index>', 'The band that contains the data', 0)
    .option('-f, --filter <expression>', 'Filter out features, value is assigned to "d"')
    .option('-i, --input <file>', 'GeoTIFF file ')
    .option('-o, --output <file>', 'GeoJSON file to write, standard out used if missing')
    .option('-p, --proj <projection>', 'Projection to use', 'WGS84')
    .option('-v, --verbose', 'Provide more detailed output, use with -o only')
    .option('--pretty-print', 'Pretty-print GeoJSON')

program.parse(process.argv)

const options = program.opts()
const { band, filter, input, prettyPrint, output, verbose } = options

if (!input) {
    throw new Error('Input file required, use -i flag or --help for more information')
}

if (!output && verbose) {
    throw new Error('Specify an output file if you use -v otherwise stdout will be polluted')
}

const writeStream = output ? fs.createWriteStream(path.resolve(cwd, output)) : process.stdout
const tiff = await fromFile(input)
const image = await tiff.getImage(0)
const geoKeys = image.getGeoKeys()
const projObj = geokeysToProj4.toProj4(geoKeys)
const projection = proj4(projObj.proj4, options.proj)
const maxX = image.getWidth()
const maxY = image.getHeight()
const origin = image.getOrigin()
const resolution = image.getResolution()
const xSize = resolution[0]
const ySize = resolution[1]

let raster = await image.readRasters({ window: [0, 0, maxX, maxY] });
let color = raster[band]
let isFirst = true

const bar = verbose ? new Progress('Processing [:bar] :percent :etas', {
    total: color.length,
    width: 40,
}) : null

const filterFn = filter && Function(`return function f(d) { return ${filter} }`)()
const transformer = transform(args => {
    const [d, i, isLast] = args

    if (filter && !filterFn(d)) {
        if (bar) bar.tick()
        if (isLast) return `]}`
        return null
    }

    const y = Math.floor(i / maxX)
    const x = i % maxX

    // Convert current pixel's coordinates to CRS by:
    // 1. Multiplying current coordinates by pixel size which will result in distance from top-left corner in CRS units.
    // 2. Adding this value to top-left corner coordinates which will result in "global" coordinates in CRS units.
    let crsX = origin[0] + x * xSize
    let crsY = origin[1] + y * ySize

    // Check if coordinates are already in meters (or other "standard" units). If not, convert them.
    let point;
    if (projObj.shouldConvertCoordinates) {
        point = geokeysToProj4.convertCoordinates(crsX, crsY, projObj.coordinatesConversionParameters);
    } else {
        point = { x: crsX, y: crsY };
    }
    // Or just multiply manually to speed up execution by removing function calls:
    point = {
        x: crsX * projObj.coordinatesConversionParameters.x,
        y: crsY * projObj.coordinatesConversionParameters.y,
    }

    let projectedPoint = projection.forward(point); // Project these coordinates

    // Work with projected coordinates
    const feature = {
        "type": "Feature",
        "properties": {
            value: d,
        },
        "geometry": {
            "type": "Point",
            "coordinates": [projectedPoint.x, projectedPoint.y]
        }
    }
    const geojson = prettyPrint ? JSON.stringify(feature, null, 2) : JSON.stringify(feature)
    const row = `${isFirst ? '' : ','}${geojson}\n${isLast ? ']}' : ''}`
    isFirst = false
    if (bar) bar.tick()
    return row
})

writeStream.write('{ "type": "FeatureCollection", "features": [\n')

transformer.pipe(writeStream)

color.forEach((d, i) => {
    const isLast = color.length - 1 === i
        // console.log({ isLast })
    transformer.write([d, i, isLast])
})