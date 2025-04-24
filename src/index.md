# Starwars Unfolded

By Erik Escoffier - <a href="https://bsky.app/profile/nerik.bsky.social">@nerik.bsky.social</a>

Source code, datasets: etc: <a href="https://github.com/nerik/sw">Github repo</a>

```js
import getSnakePaths from "./getSnakePaths.js";
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
  [4194, 2, [16]],
  [4194, 1, [16]],
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
  "live action": "#00ce7f",
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


const startOffsetPx = 130;
const totalLengthPx = 19000;
const bendRadiusPx =  100;
const lineLengthPx = 830;
const maxHeightPx = 130;
const sectionVerticalPadding = 0;
const separatorRunningTime = 15;
const defaultRunningTime = 50; // Only used for Andor S2
const defaultJarJarThreshold = 6.6;
const sectionPathsOpacity = .3;
const opacityAboveJarJar = 1;
const opacityBelowJarJar = 0.2;
const jarJarDashArray = "4px, 1px";


function hueShift(hexColor, amount) {
  const color = hsl(hexColor); // Parse to HSL
  color.h = (color.h + amount) % 360;
  if (color.h < 0) color.h += 360;
  return color.formatHex(); // Return shifted color as hex string
}

function getColor(d) {
  if (d.type === "separator") {
    return "transparent";
  }
  const shift = HUE_SHIFTS[d.section?.id] || 0;
  return hueShift(COLORS_BY_CATEGORY[d.category], shift)
}

function getTitle(d) {
  return SHORT_TITLES[d.section.id] || d.section.shortTitle;
}

function getTitlePxLength(title) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  context.font = "18px Roboto Condensed";
  return context.measureText(title).width;
}


function getRunningTime(d) {
  return d.type === "separator" ? 
    separatorRunningTime : 
    d.type === "sectionIntro" ? getTitlePxLength(getTitle(d)) * 1.3 + 60 : d.runtime || defaultRunningTime;
}

```


```js
const data = await FileAttachment("./data/starwars-chrono.json").json();
const plotTwists = await FileAttachment("./data/plot-twists.json").json();
const parseIMDBRating = (ratings) => !ratings ? null : parseFloat(ratings["Internet Movie Database"].split("/")[0]);
const allItems = data.flatMap((section) => {
  return section.items.map((item, i) => {
    const plotTwist = plotTwists.find((d) => d.id === section.id && (item.type === "movie" || (item.season === d.Season && item.episode === d.Episode)));
    return { 
      ...item,
      plotTwist,
      category: Object.keys(CATEGORIES).find((key) => CATEGORIES[key].includes(section.id)),
      rating: parseIMDBRating(section.ratings) || parseIMDBRating(item.ratings) || item.rating,
      section: {
        ...section,
        shortTitle: section.title.replace(/Star Wars: /, ""),
      }
  }})
})
// Ignore the "Star Wars: Young Jedi Adventures" section, ewoks, and Droids
// .filter(d => ![202998, 25, 3478].includes(d.section.id));
```

```js
const bg = FileAttachment("./bg.webp")
const jarJarImg = FileAttachment("./jarjar.png")
```




```js
const sortOrder = view(Inputs.radio(["story chronological", "release date"], {label: "sort order", value: "story chronological"}));
```

```js
const jarJarThreshold = view(Inputs.range([0, 10], {label: "Jar Jar threshold", value: defaultJarJarThreshold, step: 0.1}));
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

// Add new season flags
separatedItems = separatedItems.map((item, i) => {
  const prevItem = separatedItems[i - 1];
  const newSeason = prevItem && (prevItem.type === "sectionIntro" || prevItem.season !== item.season);
  return {
    ...item,
    newSeason
  }
})

// display(separatedItems)
// display(sectionsLengths)
```



```js

const padding = {
  top: 360,
  left: bendRadiusPx * 2.1,
}
const heightScale = d3.scaleLinear().domain([0, 10]).range([0, maxHeightPx]);
// const jarJarScale = d3.scaleLinear().domain([jarJarThreshold, 10]).range([0.7, 1]);
const jarJarScale = (d) => d.rating < jarJarThreshold ? opacityBelowJarJar : opacityAboveJarJar;


const svg = d3
  .select("body")
  .append("svg")
  .attr("width", lineLengthPx + padding.left * 2)
  .attr("height", totalLengthPx * .205)
  .style("background", `linear-gradient(
          rgba(0, 0, 0, 0.5), 
          rgba(0, 0, 0, 0.4)
        ), url('${await bg.url()}') no-repeat`)
  .style("background-size", "cover")
  .style("background-position", "center")

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
  .style('fill-opacity', sectionPathsOpacity)



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
    -heightScale(jarJarThreshold) / 6,
    heightScale(jarJarThreshold) / 6,
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
  .style('fill-opacity', jarJarScale)
  // .style("filter", d => d.rating >= jarJarThreshold ? "url(#glow)" : "none")
  .style("filter","url(#glow)")
  .on("mouseenter", function (event, d) {
    currentSelectionId = d.id;
    tooltip
      .style("display", "block")
      .style("color", "#333333")
      .html(`
        <img src="${d.poster}" alt="${d.title}" style="max-width: 300px; display: block">
        <strong>${d.title}</strong><br>
        ${d.type === 'episode' ? `${d.section.title} S${d.season} E${d.episode}<br>` : ''}
        <strong>Release date:</strong> ${d.release_date}<br>
        <strong>Runtime:</strong> ${d.runtime} min<br>
        <strong>Rating:</strong> ${d.rating}<br>
        <strong>Category:</strong> ${d.category}<br>
      `);



    // plot
    //   .append("g")
    //   .selectAll("path")
    //   .data(polygonsPaths.find(d2 => d2.id === currentSelectionId))
    //   .enter()
    //   .append("path")
    //   .attr("d", (d2) => d2.path)
    //   .attr("fill", "none")
    //   .attr("stroke", "#fff")

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
  // .data(polygonsPaths.filter(d => d.id === currentSelectionId))
  .data(polygonsPaths.filter(d => d.type !== "sectionIntro" && d.type !== "separator"))
  .enter()
  .append("path")
  .attr("d", (d) => d.path)
  .attr("fill", "none")
  // .attr("stroke", "#fff")
  .attr("stroke", d => d.type === "sectionIntro" ? "none" : d.rating < jarJarThreshold ? getColor(d) : "white")
  .attr("stroke-opacity", d => d.rating < jarJarThreshold ? .7 : .3)


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

// Text lines
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

plot
  .append("g")
  .append("path")
  .attr("id", "linePathUp")
  .attr("d", gridLines[5].linePath)
  // .style("stroke", "green")
  .style("fill", "none")
  .style("stroke-width", 1);

plot
  .append("g")
  .append("path")
  .attr("id", "reverseLinePathUp")
  .attr("d", gridLines[6].reverseLinePath)
  // .style("stroke", "pink")
  .style("fill", "none")
  .style("stroke-width", 1);

const getEpisodeTitle = d => `${d.episode || ''}${d.plotTwist ? d.plotTwist.Importance === "major" ? '★' : '☆' : ''}`

// Text titles in two directions
const directions = [
  {
    modesIncluded: [0, 1],
    textPathHref: "#linePath",
    sectionIntroStartOffset: d => d.currentLengthPx - 110,
    episodeStartOffset: d => (d.currentLengthPx - 120) - getEpisodeTitle(d).length * 3,
    getTitle: d => `${getTitle(d)} ▸`
  },
  {
    modesIncluded: [2, 3],
    textPathHref: "#reverseLinePath",
    sectionIntroStartOffset: d => d.currentReverseLengthPx - 90,
    episodeStartOffset: d => (d.currentReverseLengthPx - 116) - getEpisodeTitle(d).length * 3 - ([203085, 251091].includes(d.section?.id) ? 6 : 0),
    getTitle: d => `◂ ${getTitle(d)}`
  }
]

// Section intros texts
directions.forEach(({ modesIncluded, textPathHref, sectionIntroStartOffset, getTitle }) => {
  plot
    .append("g")
    .selectAll("text")
    .data(polygonsPaths.filter(d => 
      d.type === "sectionIntro" &&
      modesIncluded.includes(d.newMode || d.currentMode)))
    .enter()
    .append("text")
    .attr("dy", 5)
    .append("textPath")
    .attr("href", textPathHref)
    .attr("startOffset", sectionIntroStartOffset)
    // .attr("fill", d => COLORS_BY_CATEGORY[d.category])
    .attr("fill", "#fff")
    .attr("font-size", "18px")
    .text(getTitle); 
});

// Episode numbers
directions.forEach(({ modesIncluded, textPathHref, episodeStartOffset }) => {
  plot
    .append("g")
    .selectAll("text")
    .data(polygonsPaths.filter(d => 
      // d.type === "episode" &&
      modesIncluded.includes(d.newMode || d.currentMode)))
    .enter()
    .append("text")
    .attr("dy", 4)
    .append("textPath")
    .attr("href", textPathHref)
    .attr("startOffset", episodeStartOffset)
    // .attr("fill", d => COLORS_BY_CATEGORY[d.category])
    .attr("fill", "#fff")
    .attr("font-size", "12px")
    .text(getEpisodeTitle)
    .style("letter-spacing", "-0.1em")
});

const getSeasonTitle = (d, direction) => {
  const title = `S${d.season}`;
  return direction === "forward" ? `${title}▸` : `◂${title}`;
}

// Season numbers
const directionsSeasons = [
  {
    modesIncluded: [0, 1],
    textPathHref: "#linePathUp",
    episodeStartOffset: d => (d.currentLengthPx - 120) - getSeasonTitle(d, "forward").length * 3,
    getTitle: d =>  getSeasonTitle(d, "forward")
  },
  {
    modesIncluded: [2, 3],
    textPathHref: "#reverseLinePathUp",
    episodeStartOffset: d => d.currentReverseLengthPx - 103,
    getTitle: d => getSeasonTitle(d, "backward")
  }
]

directionsSeasons.forEach(({ modesIncluded, textPathHref, episodeStartOffset, getTitle }) => {
  plot
    .append("g")
    .selectAll("text")
    .data(polygonsPaths.filter(d => 
      d.type === "episode" 
      && d.newSeason
      // Skip season indicator for tales of the jedi, tales of the empire
      && ![203085, 251091].includes(d.section.id) 
      && modesIncluded.includes(d.currentMode)
       ))
    .enter()
    .append("text")
    .attr("dy", 4)
    .append("textPath")
    .attr("href", textPathHref)
    .attr("startOffset", episodeStartOffset)
    .attr("fill", "#fff")
    .attr("font-size", "12px")
    .text(getTitle);
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
    .style("stroke-dasharray", jarJarDashArray)
});


// Tooltips
const tooltip = d3.select("body")
  .append("div")
  .attr("id", "tooltip")
  .style("position", "absolute")
  .style("pointer-events", "none")
  .style("display", "none")
  .style("background", "#ffffffcc")
  .style("padding", "4px 8px")
  .style("border-radius", "4px")
  .style("font-size", "12px");

const header = svg
  .append("g")
  .attr("transform", `translate(${padding.left - bendRadiusPx * 1.6}, ${padding.top - 280})`)


// title 
const title = header
  .append("text")
  .attr("font-size", "40px")
  .attr("fill", "#ff0")
  // .text("Star Wars unfolded")
  .text(sortOrder === "story chronological" ? "Star Wars unfolded: chronological order" : "Star Wars watch guide: release date")
  .style("filter", "url(#glow)");


const legendItems = header
  .append("g")
  .attr("transform", `translate(0, 140)`)
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
  .attr("fill", "#fff")
  .text((d) => d);

const howToUse = header
  .append("g")
  .attr("transform", `translate(0, 30)`)
  .append("text")
  .attr("x", 0)
  .attr("y", 0)
  .attr("font-size", "18px")
  .attr("fill", "#fff")


howToUse
  .append("tspan")
  .attr("fill", "#ff0")
  .text(`A timeline of every Star Wars film, live-action show, and animated series, charted in story-order from the dawn of the Republic to the rise of the First Order.`)

howToUse
  .append("tspan")
  .attr("x", 0)
  .attr("dy", 45)
  .text(`Each entry’s height ↕ reflects its IMDb rating — the higher the rating, the taller the bar.`)

howToUse
  .append("tspan")
  .attr("x", 0)
  .attr("dy", 25)
  .text(`Entries rated above ${jarJarThreshold} appear more opaque, helping you steer past the less beloved moments in the saga — a.k.a. the "Jar Jar Zone".`)

howToUse
  .append("tspan")
  .attr("x", 0)
  .attr("dy", 25)
  .text(`Plot twist markers: ★ indicates a major twist in the story, ☆ a secondary one.`)

howToUse
  .append("tspan")
  .attr("x", 0)
  .attr("dy", 65)
  .text(`Made by Erik Escoffier - @nerik.bsky.social`)


const jarJarLegendWrapper = plot
  .append("g")
  .attr("transform", `translate(${startOffsetPx}, 0)`)

const arrowXOffsetPx = -60;
const jarJarLegendArrow = jarJarLegendWrapper
  .append("g")
  .attr("transform", `translate(${arrowXOffsetPx}, ${-heightScale(jarJarThreshold)/2})`)
  .attr("stroke-dasharray", jarJarDashArray)
  .attr("stroke", "#fff")
  // .attr("transform", `translate(${padding.left - bendRadiusPx * 1.6}, ${padding.top - 150})`)


jarJarLegendArrow
  .append("line")
  .attr("x1", 0)
  .attr("y1", 0)
  .attr("x2", 0)
  .attr("y2", heightScale(jarJarThreshold))
  .attr("marker-end", "url(#triangle)")
  .attr("marker-start", "url(#triangle)")
  .attr("markerWidth", 10)
  .attr("markerHeight", 10)

jarJarLegendArrow
  .append("line")
  .attr("x1", 0)
  .attr("y1", 0)
  .attr("x2", -arrowXOffsetPx)
  .attr("y2", 0)
jarJarLegendArrow
  .append("line")
  .attr("x1", 0)
  .attr("y1",  heightScale(jarJarThreshold))
  .attr("x2", -arrowXOffsetPx)
  .attr("y2",  heightScale(jarJarThreshold))


const jarJarText = jarJarLegendWrapper
  .append("text")
  .attr("x", arrowXOffsetPx - 10)
  .attr("y", 18)
  .attr("font-size", "18px")
  .attr("fill", "#fff")

jarJarText
  .append("tspan")
  .attr("text-anchor", "end")
  .text('Jar Jar zone');

jarJarText
  .append("tspan")
  .attr("x", arrowXOffsetPx - 10)
  .attr("dy", 19)
  .style("font-weight", "400")
  .attr("text-anchor", "end")
  .text(`IMDB rating < ${jarJarThreshold}`);

jarJarLegendWrapper
  .append("image")
  .attr("xlink:href", await jarJarImg.url())
  // Invert colors
  .style("filter", "invert(1)")
  .attr("width", 45)
  .attr("x", arrowXOffsetPx - 50)
  .attr("y", -45) 


display(svg.node());
```
