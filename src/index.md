# Starwars Chrono

```js
import getSnakePaths from "./getSnakePaths.js";
```

```js
import { hsl } from "npm:d3-color";
```

```js
const jarJar = FileAttachment("./jarjar.png").image()
```


```html 
<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400..900&display=swap');

* {
  font-family: 'Roboto Condensed', sans-serif;
  font-weight: 500;
}
</style>
```


```js
const CHRONOLOGICAL_ORDER = [
  [202998], // young jedi
  [114479], // the acolyte
  [203085, 1, [2, 3, 1]], // tales jedi
  [1893], //phantom menace I
  [203085, 1, [4]], // tales jedi
  [1894], // attack of the clones II
  // [3122, 1], // clone wars -- SKIP REBELS
  [12180], // the clone wars (movie)
  [4194, 3, [1,3]], // the clone wars
  [4194, 1, [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,17,18,19,20,21]],
  [4194, 2, [1,2,3,17,18,19,4,5,6,7,8,9,10,11,12,13,14,20,21,22]],
  [4194, 3, [5,6,7,2,4,8]],
  [4194, 1, [22]],
  [4194, 3, [9,10,11]],
  [4194, 2, [15]],
  [4194, 3, [12,13,14,15,16,17,18,19,20,21,22]],
  [4194, 4],
  [251091, 1, [1]], // tales empire
  [4194, 5, [2,3,4,5,6,7,8,9,10,11,12,13,1,14,15,16,17,18,19,20]],
  [4194, 6, [1,2,3,4,5,6,7,8,9,10,11,12,13]],
  [4194, 7, [5,6,7,8,1,2,3,4]],
  // [3122, 2], // clone wars  -- SKIP REBELS
  [4194, 7, [9]],
  [1895], // revenge sith III
  [4194, 7, [10, 11, 12]],
  [203085, 1, [5, 6]], // tales jedi
  [251091, 1, [4]], // tales empire
  [105971], // bad batch
  [251091, 1, [5,2]], // tales empire
  [92830], // obi wan
  [348350], // solo
  [83867], //andor
  [60554], //rebels
  [251091, 1, [6]], // tales empire
  [330459], // rogue one
  [11], // Original trilogy I
  [1891],
  [1892],
  [82856, 1], // mandalorian
  [251091, 1, [3]], // tales empire
  [82856, 2], // mandalorian
  [115036], // bobba fett
  [82856, 3], // mandalorian
  [114461], // ahsoka
  [202879], // skeleton crew
  [79093, 1], // Resistance
  [140607], //VII
  [181808], //VIII
  [79093, 2], // Resistance
  [181812], // IX
]


const CATEGORIES = {
  "theatrical": [1893, 1894, 12180, 1895, 348350, 330459, 11, 1891, 1892, 140607, 181808, 181812],
  "live action": [114479, 92830, 83867, 82856, 114461, 202879, 115036],
  "animated": [202998, 203085, 4194, 251091, 60554, 105971, 79093, 25 /* droids */, 3478 /* ewoks */],
}

const SHORT_TITLES = {
  1893: "Ep I",
  1894: "Ep II",
  1895: "Ep III",
  11: "Ep IV",
  1891: "Ep V",
  1892: "Ep VI",
  348350: "Solo",
  330459: "Rogue One",
  140607: "Ep VII",
  181808: "Ep VIII",
  181812: "Ep IX",
}

const COLORS_BY_CATEGORY = {
  "theatrical": "#ff0055",
  "live action": "#00FF9C",
  "animated": "#1f4cff",
}

const HUE_SHIFTS = {
  105971: -15,
  4194: -5,
  115036: 5,
  114461: 10,
  11: 3,
  1891: 6,
  1892: 9,
} 

function hueShift(hexColor, amount) {
  const color = hsl(hexColor); // Parse to HSL
  color.h = (color.h + amount) % 360;
  if (color.h < 0) color.h += 360;
  return color.formatHex(); // Return shifted color as hex string
}

function getColor(d) {
  if (d.type === "separator") {
    return "none";
  }
  const shift = HUE_SHIFTS[d.section?.id] || 0;
 return hueShift(COLORS_BY_CATEGORY[d.category], shift)
}

function getTitle(d) {
  return SHORT_TITLES[d.section.id] || d.section.shortTitle;
}


function getRunningTime(d) {
  return d.type === "separator" ? 20 : d.type === "sectionIntro" ? getTitle(d).length * 10 : d.runtime
}

```


```js
const data = await FileAttachment("./data/starwars-chrono.json").json();
const parseIMDBRating = (ratings) => !ratings ? null : parseFloat(ratings["Internet Movie Database"].split("/")[0]);
const allItems = data.flatMap((section) =>
  section.items.map((item) => ({ 
    ...item,
    category: Object.keys(CATEGORIES).find((key) => CATEGORIES[key].includes(section.id)),
    rating: parseIMDBRating(section.ratings) || parseIMDBRating(item.ratings) || item.rating,
    section: {
      ...section,
      shortTitle: section.title.replace(/Star Wars: /, ""),
    }
  }))
// Ignore the "Star Wars: Young Jedi Adventures" section, ewoks, and Droids
).filter(d => ![202998, 25, 3478].includes(d.section.id));
```

```js
const bg = FileAttachment("./bg.webp")
const jarJarImg = FileAttachment("./jarjar.png")
```




```js
const sortOrder = view(Inputs.radio(["story chronological", "release date"], {label: "sort order", value: "story chronological"}));
```

```js
const jarJarThreshold = view(Inputs.range([0, 10], {label: "Jar Jar threshold", value: 6.5, step: 0.1}));
```

```js
const sortedItems = sortOrder === 'story chronological' ? CHRONOLOGICAL_ORDER.flatMap(([id, season, episodes]) => {
  if (!season) {
    return allItems.filter(d => d.section.id === id);
  }
  if (!episodes) {
    return allItems.filter(d => d.section.id === id && d.season === season);
  }
  return episodes.map((episode) =>
    allItems.find(
      (d) => d.section.id === id && d.season === season && d.episode === episode
    )
  );
}) : allItems.sort((a, b) => {
  // TODO: use first_aired_date ??
  const aDate = new Date(a.release_date);
  const bDate = new Date(b.release_date);
  return aDate - bDate;
})

// Add separators between sections, mark first and last items of each section, and count items in each section
let currentSectionId = null;
let separatedItems = [];
let sectionsLengths = []
let currentSectionLength = 0;
sortedItems.forEach((item, i) => {
  currentSectionLength++
  const sectionId = item.section.id;
  if (sectionId === currentSectionId) {
    separatedItems.push({...item})
  } else {
    currentSectionId = sectionId;
    const newItem = {...item, isFirst: true}

    if (i > 0) {
      separatedItems[separatedItems.length - 1].isLast = true;
      separatedItems.push({
        type: "separator",
      })
     
      sectionsLengths.push(currentSectionLength)
    }
     separatedItems.push({
        type: "sectionIntro",
        category: item.category,
              // const title = SHORT_TITLES[d.section.id] || d.section.shortTitle;
        section: {
          id: item.section.id,
          shortTitle: item.section.shortTitle,
        }
      })
    currentSectionLength = 0
    separatedItems.push(newItem)
  }
});
// get section lengths
let currentSectionLengthIndex = 0;
separatedItems = separatedItems.map((item, i) => {
  if (item.type === "separator") {
    currentSectionLengthIndex++
    return item;
  }
  return {
    ...item,
    currentSectionLength : sectionsLengths[currentSectionLengthIndex],
  }
});


display(separatedItems)
display(sectionsLengths)
```



```js
const startOffsetPx = 130;
const totalLengthPx = 15000;
const bendRadiusPx =  100;
const lineLengthPx = 800;
const maxHeightPx = 130;
const sectionVerticalPadding = 0;
const separatorRunningTime = 5;
const sectionIntroRunningTime = 200;
// const jarJarThreshold = 7.5;
const padding = {
  top: 280,
  left: 200,
}
const heightScale = d3.scaleLinear().domain([0, 10]).range([0, maxHeightPx]);
const jarJarScale = d3.scaleLinear().domain([jarJarThreshold, 10]).range([0.7, 1]);


const svg = d3
  .select("body")
  .append("svg")
  .attr("width", 10000)
  .attr("height", 3500)
  .style("background", `url('${await bg.url()}') no-repeat`)
  .style("background-size", "contain")

svg
  .append("defs")
  .html(`
  			<filter id="glow">
				<fegaussianblur class="blur" result="coloredBlur" stddeviation="4"></fegaussianblur>
				<femerge>
					<femergenode in="coloredBlur"></femergenode>
					<femergenode in="SourceGraphic"></femergenode>
				</femerge>
			</filter>
      <marker
        id="triangle"
        viewBox="0 0 10 10"
        refX="10"
        refY="5"
        markerUnits="strokeWidth"
        markerWidth="10"
        markerHeight="10"
        orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#fff" />
      </marker>
      `)
const plot = svg
  .append("g")
  .attr("transform", `translate(${padding.left}, ${padding.top})`)



// Generate section paths
const { polygonsPaths: sectionsPaths, startLinesPaths } = getSnakePaths(separatedItems, {
  startOffsetPx,
  totalLengthPx,
  lineLengthPx,
  bendRadiusPx,
  itemLengthAccessor: (d) => getRunningTime(d),
  // itemHeightAccessor: (d) => 100,
  itemHeightScale: () => maxHeightPx + sectionVerticalPadding,
  itemHeightOffsetAccessor: () => -(maxHeightPx + sectionVerticalPadding) / 2,
})

// Draw sections
plot
  .append("g")
  .selectAll("path")
  .data(sectionsPaths)
  .enter()
  .append("path")
  .attr("d", (d) => d.path)
  .style("fill", getColor)
  .style('fill-opacity',.3)
  .style("stroke-width", 1);


// Generate items paths
const { polygonsPaths, gridLines, endLinesPaths } = getSnakePaths(separatedItems, {
  startOffsetPx,
  totalLengthPx,
  lineLengthPx,
  bendRadiusPx,
  itemLengthAccessor: (d) => getRunningTime(d),
  itemHeightAccessor: (d) => d.rating || 1,
  itemHeightScale: heightScale,
  itemHeightOffsetAccessor: (d) => -heightScale(d.rating || 1) / 2,
  gridLinesAt: [
    0,
    (maxHeightPx + sectionVerticalPadding) / 2,
    -(maxHeightPx + sectionVerticalPadding) / 2,
    heightScale(jarJarThreshold) / 2,
    -heightScale(jarJarThreshold) / 2,
  ]
});

let currentSelectionId = null;

// Draw items
plot
  .append("g")
  .selectAll("path")
  .data(polygonsPaths)
  .enter()
  .append("path")
  .attr("data", (d) => d.title)
  .attr("d", (d) => d.path)
  .style("fill", d => d.type === "sectionIntro" ? "transparent" : getColor(d))
  .style('fill-opacity', d => d.rating < jarJarThreshold ? .4 : jarJarScale(d.rating))
  // .style("filter", d => d.rating >= jarJarThreshold ? "url(#glow)" : "none")
  .style("filter","url(#glow)")
  .on("mouseenter", function (event, d) {
    currentSelectionId = d.id;
    tooltip
      .style("display", "block")
      .html(`
        <img src="${d.poster}" alt="${d.title}" style="max-width: 300px; display: block">
        <strong>${d.title}</strong><br>
        ${d.type === 'episode' ? `${d.section.title} S${d.season} E${d.episode}<br>` : ''}
        <strong>Release date:</strong> ${d.release_date}<br>
        <strong>Runtime:</strong> ${d.runtime} min<br>
        <strong>Rating:</strong> ${d.rating}<br>
        <strong>Category:</strong> ${d.category}<br>
      `);



    plot
      .append("g")
      .selectAll("path")
      .data(polygonsPaths.find(d2 => d2.id === currentSelectionId))
      .enter()
      .append("path")
      .attr("d", (d2) => d2.path)
      .attr("fill", "none")
      .attr("stroke", "#fff")

    // d3.select(this)
    //   .style("stroke", "#fff")
    //   .style("stroke-width", "2px");
  })
  .on("mousemove", function (event) {
    tooltip
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY + 10) + "px");
  })
  .on("mouseleave", function () {
    currentSelectionId = null;
    tooltip.style("display", "none");
        d3.select(this)
      .style("stroke", null)
      .style("stroke-width", null);
  });

// Highlights

plot
  .append("g")
  .selectAll("path")
  .data(polygonsPaths.filter(d => d.id === currentSelectionId))
  .enter()
  .append("path")
  .attr("d", (d) => d.path)
  .attr("fill", "none")
  .attr("stroke", "#fff")


// // Start lines
// plot
//   .append("g")
//   .selectAll("path")
//   // .data(startLinesPaths)
//   .data(startLinesPaths.filter(d => { 
//     return !d.previous 
//       || d.previous.section.id !== d.section.id
//       || d.previous.season !== d.season
//   }))
//   .enter()
//   .append("path")
//   .attr("d", (d) => d.path)
//   .style("fill", "none")
//   .style("stroke", getColor)
//   .style("stroke-width", d =>
//     (!d.previous || d.previous.section.id !== d.section.id)
//       ? 4
//       : 2
//   );

// Draw line
plot
  .append("g")
  .append("path")
  .attr("id", "linePath")
  .attr("d", gridLines[0].linePath)
  // .style("stroke", "blue")
  .style("fill", "none")
  .style("stroke-width", 1);

plot
  .append("g")
  .append("path")
  .attr("id", "reverseLinePath")
  .attr("d", gridLines[0].reverseLinePath)
  // .style("stroke", "red")
  .style("fill", "none")
  .style("stroke-width", 1);

// Text titles in two directions
[
  {
    modesIncluded: [0, 1],
    textPathHref: "#linePath",
    startOffset: d => d.currentLengthPx - 120,
  },
  {
    modesIncluded: [2, 3],
    textPathHref: "#reverseLinePath",
    startOffset: d => {
      const baseLength = d.currentReverseLengthPx;
      if (d.type === "movie") {
        return baseLength
      }
      const title = getTitle(d);
      return baseLength - title.length * 7
    }
  }
].forEach(({ modesIncluded, textPathHref, startOffset }) => {
  plot
    .append("g")
    .selectAll("text")
    .data(polygonsPaths.filter(d => 
      d.type === "sectionIntro" &&
      // (d.type === "movie" || d.currentSectionLength > 3) && 
      // d.isFirst ===  true &&
      modesIncluded.includes(d.currentMode)))
    .enter()
    .append("text")
    .append("textPath")
    .attr("href", textPathHref)
    .attr("startOffset", startOffset)
    // .attr("fill", d => COLORS_BY_CATEGORY[d.category])
    .attr("fill", "#fff")
    .attr("font-size", "16px")
    // .style("filter", "url(#glow)")
    // .style("text-shadow", "0px 0px 4px #fff, 0px 0px 4px #fff, 0px 0px 4px #fff, 0px 0px 4px #fff")
    .text(d => getTitle(d)); 
});


// Jar jar lines
[3, 4].forEach((i) => {
  plot
    .append("g")
    .append("path")
    .attr("id", `linePath${i}`)
    .attr("d", gridLines[i].linePath)
    .style("stroke", "#fff")
    .style("fill", "none")
    .style("stroke-width", 1)
    .style("stroke-dasharray", "2px, 2px")
});


// Tooltips
const tooltip = d3.select("body")
  .append("div")
  .attr("id", "tooltip")
  .style("position", "absolute")
  .style("pointer-events", "none")
  .style("display", "none")
  .style("background", "#ffffffaa")
  .style("padding", "4px 8px")
  .style("border-radius", "4px")
  .style("font-size", "12px");

// title 
const title = svg
  .append("text")
  .attr("x", padding.left - bendRadiusPx * 1.6)
  .attr("y", padding.top - 200)
  .attr("font-size", "40px")
  .attr("fill", "#ff0")
  .text(sortOrder === "story chronological" ? "Star Wars watch guide: chronological order" : "Star Wars watch guide: release date")
  .style("filter", "url(#glow)");

const legendItems = svg
  .append("g")
  .attr("transform", `translate(${padding.left - bendRadiusPx * 1.6}, ${padding.top - 170})`)
  .selectAll("rect")
  .data(Object.keys(CATEGORIES))
  .enter()
  .append("g")
  .attr("transform", (d, i) => `translate(${i * 150}, 0)`)

legendItems
  .append("rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", 40)
  .attr("height", 10)
  .attr("fill", (d) => COLORS_BY_CATEGORY[d])

legendItems
  .append("text")
  .attr("x", 50)
  .attr("y", 10)
  .attr("font-size", "16px")
  .attr("fill", "#ff0")
  .text((d) => d);

const text = svg
  .append("text")
    .attr("transform", `translate(${padding.left - bendRadiusPx * 1.6}, ${padding.top - 120})`)
  .attr("font-size", "16px")
  .attr("fill", "#fff")
  .text("The height of each rectangle represents the IMDB rating of the movie/episode.");

const jarJarLegendWrapper = plot
  .append("g")
  // .attr("transform", `translate(${padding.left - bendRadiusPx * 1.6}, ${padding.top - 150})`)

const jarJarLegend = jarJarLegendWrapper
  .append("g")
  .attr("transform", `translate(-20, ${-heightScale(jarJarThreshold)/2})`)
  // .attr("transform", `translate(${padding.left - bendRadiusPx * 1.6}, ${padding.top - 150})`)

jarJarLegend
  .append("line")
  .attr("x1", 0)
  .attr("y1", 0)
  .attr("x2", 0)
  .attr("y2", heightScale(jarJarThreshold))
  .attr("stroke", "#fff")
  .attr("stroke-width", 1)
  .attr("stroke-dasharray", "2px, 2px")
  .attr("marker-end", "url(#triangle)")
  .attr("marker-start", "url(#triangle)")
  .attr("markerWidth", 10)
  .attr("markerHeight", 10)

const jarJarText = jarJarLegendWrapper
  .append("text")
  .attr("x", -30)
  .attr("y", 20)
  .attr("font-size", "16px")
  .attr("fill", "#fff")

jarJarText
  .append("tspan")
    .attr("text-anchor", "end")
  .text(`Jar Jar zone: ${jarJarThreshold}`);

jarJarText
  .append("tspan")
  .attr("x", -30)
  .attr("dy", 20)
  .style("font-weight", "400")
  .attr("text-anchor", "end")
  .text("Watch at your own risk!");

jarJarLegendWrapper
  .append("image")
  .attr("xlink:href", await jarJarImg.url())
  // Invert colors
  .style("filter", "invert(1)")
  .attr("width", 50)
  .attr("x", -80)
  .attr("y", -50) 


display(svg.node());
```
