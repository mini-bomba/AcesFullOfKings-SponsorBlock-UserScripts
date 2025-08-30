// ==UserScript==
// @name          Coloured Categories
// @description   Adds category colours to Category column sb.ltn.fi
// @version       1.3.3
// @author        ChatGPT, AcesFullOfKings, TheJzoli, mini_bomba
// @grant         GM_setValue
// @grant         GM_getValue
// @match         https://sb.ltn.fi/*
// @updateURL     https://raw.githubusercontent.com/mini-bomba/AcesFullOfKings-SponsorBlock-UserScripts/rewrite/colourTableCellsByCategory.user.js
// @downloadURL   https://raw.githubusercontent.com/mini-bomba/AcesFullOfKings-SponsorBlock-UserScripts/rewrite/colourTableCellsByCategory.user.js
// @icon          https://sb.ltn.fi/static/browser/logo.png
// ==/UserScript==

(function() {
  'use strict';

  const COLOURS = {
    filler: '#7300FF',          // lilac
    sponsor: '#00d400',         // light green
    selfpromo: '#ffff00',       // yellow
    interaction: '#cc00ff',     // pink
    outro: '#0202ed',           // dark blue
    intro: '#00ffff',           // light blue
    preview: '#008fd6',         // middle blue
    poi_highlight: '#ff1684',   // kinda salmon-y pink idk
    exclusive_access: '#008a5c',// kinda murky greeny grey ish
    chapter: '#ffd679',
    hook: '#395699',
  };

  // Find the Category column, save its index
  const columnHeads = document.querySelector("table thead tr").children;
  let categoryColIndex = -1;
  for (const i in columnHeads) {
    if (columnHeads[i].innerText == "Category") {
      categoryColIndex = Number(i); // i love javascript
      break;
    }
  }
  if (categoryColIndex == -1) {
    throw Error("Coloured Categories: Failed to find the Category column");
  }

  // Generate and install CSS styles for the squares
  let cssCode = `
    #sbbcc-radius {
      order: 1;
      display: flex;
      flex-direction: column;
    }
    .categoryCell::before {
      content: " ";
      width: 0.75em;
      height: 0.75em;
      margin-right: 0.25em;
      border-radius: var(--sbbcc-radius, 0);
      display: inline-block;
    }
  `
  for (const [name, color] of Object.entries(COLOURS)) {
    cssCode += `
      .categoryCell[data-category="${name}"]::before {
        background-color: ${color};
      }
    `
  }
  const styleElement = document.createElement("style");
  styleElement.innerHTML = cssCode;
  styleElement.id = "sbbcc-styles";
  document.head.appendChild(styleElement);

  const table = document.querySelector('.table');
  const headerRow = table.querySelector('thead tr');
  const headerCells = headerRow.querySelectorAll('th');

  // Create a global slider for border radius in the navbar
  const sliderContainer = document.createElement('div');
  sliderContainer.id = "sbbcc-radius";
  const sliderLabel = document.createElement("label");
  sliderLabel.for = "sbbcc-radius-slider";
  sliderLabel.innerText = "Category label radius:"
  sliderContainer.appendChild(sliderLabel);
  const slider = document.createElement("input");
  slider.type="range";
  slider.id="sbbcc-radius-slider";
  slider.value = GM_getValue("radius", 0); // read previous stored radius preference from storage
  slider.min = 0;
  slider.max = 50;
  slider.step = 0.5;
  sliderContainer.appendChild(slider);
  document.querySelector('nav > div').appendChild(sliderContainer);
  document.body.style.setProperty("--sbbcc-radius", `${slider.value}%`); // set the radius variable for the first time

  slider.addEventListener('input', () => {
    document.body.style.setProperty("--sbbcc-radius", `${slider.value}%`);
    GM_setValue("radius", slider.value);  // save radius preference
  });

  function markCells() {
    // Find all category cells with CSS selectors
    for (const cell of document.querySelectorAll(`td:nth-child(${categoryColIndex+1})`)) {
      cell.classList.add("categoryCell");
      for (const node of cell.childNodes) {
        if (node.nodeName != "#text") continue;  // search for the first child text node, to avoid extracting strings from other userscripts
        cell.setAttribute("data-category", node.textContent);
        break;
      }
    }
  }

  // Mark category cells with appropriate classes and attributes
  markCells();
  document.addEventListener('forceRefresh', markCells);
})();
