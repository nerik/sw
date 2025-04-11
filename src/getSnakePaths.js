import * as d3 from "npm:d3";
import svgpath from "npm:svgpath";
import reverse from "npm:svg-path-reverse"

export default function getSnakePaths(items, params) {
  const {
    startOffsetPx,
    totalLengthPx,
    itemLengthAccessor,
    itemHeightOffsetAccessor,
    itemHeightScale,
    itemHeightAccessor,
    lineLengthPx,
    bendRadiusPx,
    gridLinesAt,
  } = params;

  // Calculate total lentgh using length accessor
  const totalLength = items.reduce(
    (acc, d) => acc + itemLengthAccessor(d),
    startOffsetPx || 0
  );


  // Build length scale using totalLength and totalLengthPx
  const lengthScale = d3
    .scaleLinear()
    .domain([0, totalLength])
    .range([0, totalLengthPx]);



  const getLinePath = (lengthStart, lengthEnd, lengthScale, currentY, itemHeightOffset, itemHeightPx, currentMode, type, lineOffset) => {
    const lengthStartPx = lengthScale(lengthStart);
    const lengthEndPx = lengthScale(lengthEnd);
    const lineOffsetMult = [1,2].includes(currentMode) ? -1 : 1;
    let itemYStart = type === 'gridLines' ? currentY +  lineOffset * lineOffsetMult : currentY + itemHeightOffset;
    let itemYEnd = itemYStart + itemHeightPx;

    const coords = [
      [ lengthStartPx,  itemYStart],
      [ lengthEndPx,  itemYStart],
      [ lengthEndPx,  itemYEnd],
      [ lengthStartPx,  itemYEnd],
    ]

    if (type === 'gridLines') {
      return { path: `M ${coords[0].join(' ')} L ${coords[1].join(' ')}` };
    } else if (type === 'endLines') {
      return { path: `M ${coords[1].join(' ')} L ${coords[2].join(' ')}` };
    } else if (type === 'startLines') {
      return { path: `M ${coords[0].join(' ')} L ${coords[3].join(' ')}` };
    }

    return { path: `M ${coords[0].join(' ')} L ${coords[1].join(' ')} L ${coords[2].join(' ')} L ${coords[3].join(' ')} Z` };
  };

  const getArcPath = (lengthStart, lengthEnd, lengthScale, centerX, centerY, heightOffset, currentMode, type, lineOffset) => {
    const arcStart = lengthScale(lengthStart);
    const arcEnd = lengthScale(lengthEnd);
    const angleStart = arcStart / bendRadiusPx;
    const angleEnd = arcEnd / bendRadiusPx;

    const lineOffsetMult = [1,2].includes(currentMode) ? -1 : 1;
    const outerRadius = type === 'gridLines' ?  bendRadiusPx + lineOffset * lineOffsetMult : bendRadiusPx + -heightOffset;
    const innerRadius = type === 'gridLines' ? outerRadius - 1 : bendRadiusPx - -heightOffset;

    const angleMultiplier = currentMode === 3 ? -1 : 1;

    const arc = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(angleStart * angleMultiplier)
      .endAngle(angleEnd * angleMultiplier);

    const path = arc();
    const translated = svgpath(path).translate(centerX, centerY).toString();

    if (type === 'gridLines') {
      return { path: translated.split('L')[0] };
    } else if (type === 'startLines') {
      // TODO FIx this, decompose commands with svgpath
      const coords = translated.match(/M([\d.]+) ([\d.]+).*L([\d.]+) ([\d.]+).*A[^A]* ([\d.]+) ([\d.]+)Z/);
      if (!coords || !coords.length) return { path: '' };
      const [ , x0, y0, x1, y1, x2, y2 ] = coords.map(Number);
      return { path: `M ${x0} ${y0} L ${x2} ${y2}` };
    }
    return { path: translated };
  };

  const getPath = (currentMode, lengthStart, lengthEnd, lengthScale, centerX, centerY, heightOffset, itemHeightPx, type, lineOffset) => {
    if (currentMode % 2 === 0) {
      return getLinePath(lengthStart, lengthEnd, lengthScale, centerY, heightOffset, itemHeightPx, currentMode, type, lineOffset);
    } else {
      return getArcPath(lengthStart, lengthEnd, lengthScale, centerX, centerY, heightOffset, currentMode, type, lineOffset);
    }
  }

  // Bend length should be half the perimeter of a circle with radius bendRadiusPx
  const bendLength = Math.PI * bendRadiusPx;
  const modeLengths = [lineLengthPx, bendLength, lineLengthPx, bendLength];
  const modeLengthsScales = [
    d3.scaleLinear().domain([0, lineLengthPx]).rangeRound([0, lineLengthPx]),
    d3.scaleLinear().domain([0, bendLength]).rangeRound([0, bendLength]),
    d3.scaleLinear().domain([0, lineLengthPx]).rangeRound([lineLengthPx, 0]),
    d3.scaleLinear().domain([0, bendLength]).rangeRound([0, bendLength]),
  ];


  const getPathsForType = (items, type, lineOffset = 0) => {
    let currentLengthPx = startOffsetPx || 0;
    let currentModePosition = startOffsetPx || 0;
    let currentReverseLengthPx = totalLengthPx;
    let currentMode = 0; // 0: left to right, 1: right bend, 2: right to left, 3: left bend
    let currentY = 0;

    const paths = items.flatMap((d, i) => {
      const itemLength = itemLengthAccessor(d);
      const itemLengthPx = lengthScale(itemLength || 0) || 0;
      currentReverseLengthPx -= itemLengthPx;
      const pathObj = { ...d, previous: items[i-1], next: items[i+1], currentMode, currentLengthPx, currentReverseLengthPx };

      currentLengthPx += itemLengthPx;
      if (!itemLengthPx) {
        return [];
      }
      const itemHeight = itemHeightAccessor ? itemHeightAccessor(d) : 1;
      const itemHeightPx = itemHeightScale(itemHeight);
      const itemHeightOffset = itemHeightOffsetAccessor(d);

      let itemLengthStart = currentModePosition;
      let itemLengthEnd = currentModePosition + itemLengthPx;
      let itemYStart = currentY + itemHeightOffset;
      let itemYEnd = itemYStart + itemHeightPx;
      let centerX = (currentMode === 1) ? lineLengthPx : 0;

      let currentModeLength = modeLengths[currentMode];
      let currentModeLengthScale = modeLengthsScales[currentMode];

      if (itemLengthEnd > currentModeLength) {
        const lengthLeft = currentModeLength - currentModePosition;
        itemLengthEnd = itemLengthStart + lengthLeft;
        const newLength = itemLengthPx - lengthLeft;
        const pathLeft = getPath(
          currentMode,
          itemLengthStart,
          itemLengthEnd,
          currentModeLengthScale,
          centerX,
          currentY,
          itemHeightOffset,
          itemHeightPx,
          type,
          lineOffset
        );

        currentMode += 1;
        if (currentMode > 3) currentMode = 0;
        currentY += bendRadiusPx;
        currentModePosition = newLength;
        
        itemLengthStart = 0;
        itemLengthEnd = 0 + newLength;
        itemYStart = currentY +  itemHeightOffset;
        itemYEnd = itemYStart + itemHeightPx;
        centerX = currentMode === 1 ? lineLengthPx : 0;
        
        currentModeLength = modeLengths[currentMode];
        currentModeLengthScale = modeLengthsScales[currentMode];


        const pathNew = getPath(
          currentMode,
          itemLengthStart,
          itemLengthEnd,
          currentModeLengthScale,
          centerX,
          currentY,
          itemHeightOffset,
          itemHeightPx,
          type,
          lineOffset
        );

        return [
          {...pathObj, path: [pathLeft.path, pathNew.path].join(' ')},
        ]
      }

      const itemPath = getPath(
        currentMode,
        itemLengthStart,
        itemLengthEnd,
        currentModeLengthScale,
        centerX,
        currentY,
        itemHeightOffset,
        itemHeightPx,
        type,
        lineOffset
      );
      currentModePosition = itemLengthEnd;

      return [{ ...pathObj, ...itemPath }];
    });
    return paths;
  }

  // const linePaths = getPathsForType(items, 'gridLines', 60);
  // const mergedLinePath = [linePaths[0].path].concat(linePaths.slice(1).map((d, i) => {
  //   // console.log(d.path, d.path.split('L')[1]);
  //   return d.path.split('L')[1] ? `L ${d.path.split('L')[1]}` : `A ${d.path.split('A')[1]}`;
  // })).join(' ');

  const gridLines = (gridLinesAt || [0]).map(at => {
    const linePaths = getPathsForType(items, 'gridLines', at);
    if (linePaths.length === 0) return null;
    const linePath = [linePaths[0].path].concat(linePaths.slice(1).map((d, i) => {
      return d.path.split('L')[1] ? `L ${d.path.split('L')[1]}` : `A ${d.path.split('A')[1]}`;
    })).join(' ');
    const reverseLinePath = reverse.reverse(linePath)
    return {
      linePaths,
      linePath,
      reverseLinePath
    }
  })


  return {
    polygonsPaths: getPathsForType(items, 'fills'),
    endLinesPaths: getPathsForType(items, 'endLines'),
    startLinesPaths: getPathsForType(items, 'startLines'),
    gridLines
  };
}
